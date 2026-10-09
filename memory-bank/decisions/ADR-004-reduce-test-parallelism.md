# ADR-004: Reduce Nx Test Parallelism Instead of Raising Jest Timeouts

## Status

Accepted

## Context

After running `build/sh/package-upgrade.sh`, the `npm run all` step failed in the
`sqlite3orm` test suite:

```
FAIL  src/lib/spec/core/SqlDatabase.spec.ts (44.55 s)
  ● test SqlDatabase › expect basic dmls to succeed
    thrown: "Exceeded timeout of 30000 ms for a test."
```

`expect basic dmls to succeed` is a trivial test (in-memory DB, few ms of real work). This is
the same class of failure as ADR-003 Problem 2, one escalation further:

- ADR-003 raised the `sqlite3orm` `testTimeout` from the Jest default of 5000 ms to 30000 ms.
- This failure shows the cause is not an inadequate timeout budget but **Jest worker starvation**:
  `npm run test` ran `nx run-many --target=test --parallel=4`, so 4 Nx test tasks ran
  concurrently, each spawning its own Jest workers, all with coverage instrumentation forced on
  by `jest.preset.js` (`collectCoverage: true`). Sibling suites in the same run took 44-46 s
  wall-clock for work that completes in ~10 s when the machine is not oversubscribed.

Raising the timeout again (30000 -> 60000/120000) would only mask the oversubscription, slow down
genuinely broken runs (a hung test would take even longer to surface), and leave the root cause
in place for the next escalation.

### Timeline: why this surfaced now (after years of stability)

The `--parallel=4` test script is old and stable for ~3 years (since 2023, commits `e261faa`,
`150bc90`) — it was never the problem by itself. What changed in the two weeks before the
incidents:

- 2026-09-27 (`c77b509`): Jest was unpinned from 30.4.x (ADR-002) to 30.5.2. Jest 30.5
  replaced the ESM module evaluation strategy (ADR-002 context, PR #16391), changing suite
  startup and timing characteristics for all ESM suites.
- 2026-10-04 (`293b454`): Node 24 -> 26. ADR-003 already documented that Node 26 changed
  GC/scheduling characteristics enough to expose latent timing fragility — the first incident
  (ADR-003 Problem 2, CI 5000 ms timeout) occurred the same day.
- 2026-10-09: second incident — the 30000 ms timeout failure described above, during
  `package-upgrade.sh`.

Both incidents share the same structural conditions: **Node 26 runtime + cold Nx cache + 4
parallel test tasks**. Routine local runs rarely exercise the oversubscription because the Nx
cache absorbs them (12/13 tasks typically served from cache); the scenarios that always run
cold are exactly where the failures clustered:

- `package-upgrade.sh`: `npx nx migrate` mutates `package.json`, invalidating the cache — the
  failed run showed `Cache: 0/12 hit (0%)`, so all 13 projects' Jest workers really ran,
  4 Nx tasks at a time.
- CI: 2-vCPU runners with 4 parallel Nx test tasks (ADR-003, Problem 2).

## Decision

Reduce Nx test-task parallelism from 4 to 2 in the root `package.json` `test` script:

```diff
- "test": "cross-env NODE_OPTIONS=--experimental-vm-modules nx run-many --target=test --parallel=4 --verbose",
+ "test": "cross-env NODE_OPTIONS=--experimental-vm-modules nx run-many --target=test --parallel=2 --verbose",
```

- Keep the `sqlite3orm` package's `testTimeout: 30000` (per ADR-003) unchanged. With 2 parallel
  test tasks, the 30000 ms budget provides ample headroom: the previously failing
  `SqlDatabase.spec.ts` suite completes in ~10.7 s in a full run (verified).
- Do not change `lint`/`build` parallelism (`--parallel=4`): those targets are CPU-bound
  compile/lint work without the per-worker Jest overhead and did not exhibit starvation.
- `nx.json` has no `parallel` default, so the CLI flag in the npm script is the single source
  of truth; CI uses the same `npm run test` script (via `npm run ci`), so both local and CI
  runs get the reduced parallelism.

## Consequences

### Positive

- Root cause (oversubscription) is addressed rather than masked; test wall-clock times drop to
  near-unloaded levels even in full runs.
- A genuinely hung test still fails within a bounded, reasonable 30000 ms budget.
- Verified in a full `npm run test`: 21 suites / 257 tests pass for `sqlite3orm`, all 13 projects
  succeed, coverage unchanged (99.05% statements).
- Works identically in CI since `npm run ci` invokes the same `test` script.

### Negative

- Full test runs get slower on large machines with many idle cores (2 Nx tasks in parallel
  instead of 4; within each task Jest still parallelizes spec files across workers).
- On even smaller CI runners (2 vCPU), starvation could still occur; if it does, the next lever
  is a per-run `--parallel=1` or Nx Cloud flaky-task retries, not another timeout raise.

## Related

- Supersedes the escalation path of ADR-003 Problem 2 (which raised `testTimeout` to 30000 ms;
  that value stays).
- `build/sh/package-upgrade.sh` invokes `npm run all`, which invokes `npm run test` — the failing
  step of the package upgrade is fixed by this change.
- Reproduction: before the fix, `SqlDatabase.spec.ts` failed with a 30000 ms timeout while
  sibling suites took 44-46 s wall-clock; after the fix the same suite runs in 10.74 s and the
  full run passes.

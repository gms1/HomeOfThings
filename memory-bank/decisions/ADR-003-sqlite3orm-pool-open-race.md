# ADR-003: Serialize Concurrent Opens in SqlConnectionPool

## Status

Accepted

## Context

After upgrading from Node.js 24 to Node.js 26, the `SqlConnectionPool` test suite became
flaky, failing intermittently (~60% of runs under system load) in two distinct ways:

1. **Local**: `expect opening pool multiple times (using different files) to fail` failed with
   `SQLITE_CANTOPEN: unable to open database file` (see `src/lib/spec/core/SqlConnectionPool.spec.ts`).
2. **CI**: `BaseDAO › expect selectEach to succeed` failed with `Exceeded timeout of 5000 ms for a test`
   (see `src/lib/spec/BaseDAO.spec.ts`).

The Node 26 upgrade did not break the code itself — it changed event-loop scheduling timings
just enough to expose two latent, timing-dependent problems.

### Problem 1: Race in `SqlConnectionPool.open()`

`open()` used a single `this._opening` promise as a "deduplication" gate for concurrent calls:

```typescript
// old (buggy)
if (this._opening) {
  await this._opening;            // (A) all callers wait on the SAME promise
  if (this.databaseFile === databaseFile && ...) {
    return;                      // (B) dedup check reads shared state
  }
}
this._opening = this.openInternal(databaseFile, mode, min, max, settings);  // (C)
await this._opening;
this._opening = undefined;        // (D) finally: clears gate unconditionally
```

Three defects:

- **(A)** Multiple concurrent callers resumed on the _same_ in-flight `openInternal()`, then
  all fell through to (C) — running **multiple** `openInternal()` calls concurrently on one pool.
- **(B)** `openInternal()` mutates shared state (`this.databaseFile`, `this.mode`) _before_
  awaiting connection opens; a concurrently running `openInternal()` for `test1.db` could read
  `this.mode` already mutated by another `openInternal()` for `test3.db`.
- **(C)/(D)** `this.mode &= ~SQL_OPEN_CREATE` (strip CREATE after first connection) was applied
  to the shared `this.mode`, so a _different_ file's open used a mode with CREATE stripped →
  `SQLITE_CANTOPEN` for not-yet-existing files. Additionally, (D) cleared the gate for _newer_
  callers, letting yet another wave of opens run concurrently.
- The test `expect opening pool multiple times (using same file and mode) to succeed` relies on
  the dedup path (B), which is why the race only surfaced when timing shifted.

### Problem 2: Jest default test timeout under starved CI runners

`selectEach` is a trivial test (in-memory DB, few ms of real work). On CI (2 vCPU, 4 parallel
Jest workers, coverage instrumentation), worker starvation can make even trivial tests exceed
Jest's default `testTimeout` of 5000 ms. Node 26 changed GC/scheduling characteristics enough
that this latent fragility became visible.

## Decision

1. **Serialize concurrent `open()` calls** in `SqlConnectionPool` via an arrival-ordered promise
   chain: each `open()` caller captures the previous gate, installs a new one, awaits the
   previous gate (not the shared in-flight open), then runs its own `openInternal()` — so
   `openInternal()` calls on one pool never interleave. The gate is cleared only by its own
   owner (`this._opening === opened`), preserving the documented semantics:
   - concurrent same-file/mode opens are deduplicated (first one wins, followers return),
   - concurrent different-file opens run sequentially ("last one wins", same as sequential).
2. **Harden `openInternal()`** to use local variables for `databaseFile`/`mode`/`settings`
   (captured at call time, not re-read from shared fields after awaits), and to strip
   `SQL_OPEN_CREATE` only from the local `openMode` used for secondary connections — never
   mutating a shared field mid-flight. This is defense-in-depth: even if the pool is closed or
   reopened while an open is in progress, connections open with their originally requested
   parameters.
3. **Raise `testTimeout` to 30000 ms** for the `sqlite3orm` package's Jest config, since its
   suites are the heaviest (file I/O for pools, coverage instrumentation) and CI runners are
   heavily oversubscribed.

## Consequences

### Positive

- The `SQLITE_CANTOPEN` failure is eliminated (verified: 0 failures in 25 consecutive runs of
  the pool spec and 0 failures in 10 consecutive full-suite runs under extreme CPU load,
  pre-fix failure rate was ~60% under identical conditions).
- The CI 5s-timeout failure is eliminated; flaky timeouts no longer interrupt CI runs.
- No API change: consumers (`nestjs-sqlite3` `ConnectionManager`, specs) call `open()` once per
  pool or rely on the dedup path — both semantics preserved.
- `openInternal()` is now re-entrant-safe against concurrent `close()`.

### Negative

- Concurrent different-file opens on the same pool now serialize (they previously raced — the
  race was the bug); sequential behavior ("last one wins") is unchanged.
- A genuinely hung open can delay followers for up to that open's duration instead of failing
  fast (acceptable: opens are short-lived connection setups).

## Related

- Reproduction: 12 background CPU spinners + full package suite; failure manifested exactly as
  reported by the user (`SQLITE_CANTOPEN` locally, 5000 ms timeout in CI) before the fix, and
  ceased after.
- Jest ESM context: see ADR-001 and ADR-002 for the `--experimental-vm-modules` requirement.

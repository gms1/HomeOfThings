# AI Agent Instructions

> These instructions are for AI agents (like Roo/Cline) working on this project.

## Notes

These instructions apply to all future sessions working on this project.

## Communication

- **Ask before choosing** - When there are multiple valid approaches to solve a problem, present the options and ask which one the user prefers rather than implementing one arbitrarily.
  Don't make decisions or implement solutions without user confirmation when there are alternatives available.

- **Wait for choices** - When presenting multiple options or approaches, wait for the user to choose before implementing anything.

- **Wait for results** - When asking the user to check something or run a command, wait for the response before proceeding with next steps.

- **Verify claims** - Only state what you actually verified

- **Answering user questions**
  - Try to keep your answer short and do not embellish your answer with assessments based on assumptions.
  - Wait for feedback before proceeding with other things or asking questions about other things.
  - Do not change the subject/topic.

## Git

### Commit workflow (mandatory)

After implementing changes, follow this procedure:

1. **Present a summary** of all changes made (files modified, added, deleted)
2. **Stop and wait** for the user to explicitly request a commit — do NOT proceed to `git commit` on your own
3. Only when the user explicitly asks to commit or amend, execute `git add` and `git commit` with a commit message that always contains a `Co-authored-by` trailer, identifying the AI agent and model used:

```text
Co-authored-by: <AgentName> (<Model>) <email>
```

This checkpoint exists because implementing changes and committing them are separate concerns. The user may want to review, adjust, or split changes before they become part of the repository history.

## Coding

- **Format documentation** — After changing any documentation files (Markdown, etc.), run `npm run format:write` to ensure consistent formatting.

- **Test your changes** — After implementing any code change, run the relevant tests to verify correctness before considering the task complete. If a project-level CI command exists (e.g. `npm run ci`), use it to validate. Do not mark work as done until tests pass.

- Do not add comments for trivial code, e.g:
  ```
  // Trim leading whitespace
  const trimmed = dbtype.trimStart();
  ```

## Command Execution

- Do not prefix commands unnecessarily with `cd /path/to/current/working/directory &&` when the command should run in the current working directory

## Plans

Never refer to a plan (files in `plans/`) from any memory bank file except `activeContext.md`

Plans are temporary: once implemented, the related active context is moved to `progress.md`.

The client may then review all the changes and remove the plan file, so all references to plans in `progress.md`, `decisionLog.md`, `development.md`, or `project-overview.md` would become stale/broken

## Memory Bank

The most important part of the Memory Bank is keeping it updated. Currently, the community standard is the UMB (Update Memory Bank) routine:

- Before you start a task: Ask your AI agent, "Read the memory bank and tell me the current status."

- While working, the AI agent will occasionally suggest updates to activeContext.md.

- Before you end a session: Simply type "UMB" or "Update memory bank". The AI agent will then:

  - Move completed items from activeContext.md to progress.md.

  - Log any new technical decisions in decisionLog.md.

  - Clear the activeContext.md for the next session.

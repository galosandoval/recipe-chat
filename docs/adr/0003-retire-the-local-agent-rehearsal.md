# ADR 0003 — Retire `agent/local`; rehearse the agent loop in CI, not in Docker

Date: 2026-08-25
Status: Accepted
Issues: #541, #637

## Context

`agent/local/` was the loop's rehearsal rig (#541): a Dockerfile, a compose
file with a pgvector service, an entrypoint, a `run.sh`, and a `run-with-guards`
supervisor, driven by `bun run agent:local`. It existed to answer "would this
run work in CI?" without spending a CI runner, back when the sequencing that
decided a run lived in 323 lines of workflow YAML that nothing could execute
locally.

The `1.0.0` upgrade (#637) removed the thing it was rehearsing. All four
adapter scripts and almost all of the workflow are now one call to
`shopfloor-run-phase` — a typed, tested function inside the package, with its
own test suite in the package's repository. What is left in this repo is
service setup and a pinned CLI install.

That left the rig with a maintenance cost and no matching answer. It duplicated
the pgvector service, the migrate/seed sequence, and the CLI pin — the drift
`run-policy.ts` was written to prevent — and it rehearsed a `runImplementAgent`
call that `1.0.0` refuses by name. Keeping it meant porting all of it to the
new verb; #637 named that as an open question ("decide separately what
`agent/local/` becomes") rather than assuming an answer.

## Decision

**Retire it.** `agent/local/` and the `agent:local` script are deleted. The
`agent:implement` loop is rehearsed by running it — label a scratch issue and
read the run — and debugged from the transcript artifact the workflow uploads
on every run, success or failure.

The harness's own behaviour is rehearsed in the harness's repository, which is
where its tests are.

## Consequences

- A change to the run policy or the workflow is no longer verifiable without
  spending a CI runner. The runner is cheap; the rig's upkeep was not.
- `LOCAL_WALL_CLOCK_MINUTES` and `LOCAL_IDLE_MINUTES` go with it. They were
  passthrough overrides that shortened the guards for an impatient local run;
  nothing in CI ever set them, and `OPTIONAL_ENV_VARS` — the allowlist that
  existed so a local `sudo` drop could not strip them — is gone too.
- The Docker image was the only consumer of `CLAUDE_CODE_CLI_VERSION` besides
  the workflow. The pin now has one reader, so "the rehearsal runs the exact
  CLI CI runs" stops being an invariant anyone has to maintain.
- If a local rehearsal is wanted again, it should drive `shopfloor-run-phase`
  against a synthetic payload — the other option #637 named — rather than
  restate any part of the run policy. Nothing here forecloses that.

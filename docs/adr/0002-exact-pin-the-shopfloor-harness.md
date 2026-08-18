# ADR 0002 — Exact-pin `@galosandoval/shopfloor`; upgrade deliberately, never automatically

Date: 2026-08-10
Status: Accepted
Issues: galosandoval/shopfloor#7

## Context

The `agent:implement` pipeline runs on `@galosandoval/shopfloor`, which owns the
runaway guards, the required-env contract, the command-guard hook, and the
precondition checks that decide whether a run may spend tokens at all. This repo
has pinned it exactly (no caret) since the extraction.

Exact pinning has a visible cost, and this ticket is the cost: `0.4.0`, `0.5.0`,
and `0.6.0` shipped while this repo sat on `0.3.0`, so guards that existed on
npm were armed in no live pipeline. Nobody notices a dependency that never
moves.
Now that the package publishes a changelog and tags, a caret range (`^0.6.0`)
would have closed that gap on its own.

The argument against is what the intervening releases actually contained.
Pre-`1.0.0`, a shopfloor minor is where behavior changes land:

- `0.4.0` armed `wallClockMinutes`, a field this repo had set to `45` for months
  while nothing read it. The upgrade turned a decorative number into a process
  kill — with no type error, and with the workflow's `timeout-minutes` set to
  the same `45`, which would have raced.
- `0.5.0` made a `STANDARDS_DIR` that resolves to nothing a hard refusal. Ours
  did not resolve. Under a caret range that release would have failed every
  agent run the moment it published, on a machine nobody was watching.

Both were correct changes, correctly documented as minor under `0.x` semver. A
caret range would have picked them up unattended and taken the pipeline down or
changed how it kills runs, in a workflow that only ever runs unattended.

## Decision

**Keep the exact pin.** A shopfloor upgrade is an explicit commit that reads the
changelog entry, checks this repo's config against the new failure modes, and
lands as a reviewable diff — this one bumps `0.3.0` → `0.6.0` and carries the
two config fixes those releases demanded.

The pin is not a reason to fall behind. Revisit when shopfloor reaches `1.0.0`,
where a minor stops being allowed to change run behavior and a caret range
starts meaning what it says.

## Consequences

- Guards published to npm are not armed here until someone bumps the version.
  That lag is now a known cost paid deliberately, not a surprise.
- Each bump reads the changelog's failure-mode notes against this repo's
  `run-policy.ts` and workflow env before landing. The two fixes in this
  upgrade — the standards path and the job-timeout margin — are what that
  reading is for.
- Renovate/Dependabot, if enabled later, should open shopfloor bumps as PRs to
  review, never automerge them.

The one release consequence this upgrade reads and then deliberately leaves
alone: `0.5.0` started _comparing_ `cliVersion` (`2.1.208`) against the running
`claude --version` instead of only recording it. The default strictness is
`warn`, and the workflow installs exactly the pinned version, so a mismatch can
only mean the install step drifted — worth a warning in the log, not worth
refusing a run over. Revisit if that warning ever fires.

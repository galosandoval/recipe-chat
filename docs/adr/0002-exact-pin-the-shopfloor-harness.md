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

## Addendum — 2026-08-25, at `1.0.0` (#637)

The decision above said to revisit when shopfloor reached `1.0.0`, where a minor
stops being allowed to change run behavior and a caret range starts meaning what
it says. It has, and **the exact pin stays.**

What `1.0.0` actually demanded of this repo is the argument: deleting four
adapter scripts and 323 lines of workflow, removing three environment variables
the run now refuses **by name**, and re-writing the prompt. A caret range would
not have helped with any of it — the release is a migration, not a bump — and
the failure mode it protects against is unchanged: this pipeline only ever runs
unattended, so a version that arrives without someone reading the changelog
arrives on a machine nobody is watching.

One thing did change, and it argues the same way: from `1.0.0` the harness
**writes to this repository during a run** — the branch, the draft PR, the
issue's labels, and its own handoff commits. An unattended upgrade to something
holding a write-scoped PAT is a larger thing to do accidentally than it was.

The pin now lives in two places — `package.json` and the `npx` invocations in
`.github/workflows/agent-implement.yml` — and `run-policy.test.ts` holds them
equal, so a bump that moved only one of them fails rather than silently running
a harness nobody chose.

## Addendum — 2026-09-18, at `1.1.0`

The first bump under real semver, and the pin behaved as designed: a minor
arrived with one documented behavior change and it was read before it landed.

`1.1.0` renders the agent's `stream-json` output as job-log lines instead of
passing the raw JSONL through stdout. **Nothing here parsed that stdout** — the
`admit` job parses its own verdict JSON from a different bin, and
`run-trajectory-check.ts` reads the transcript artifact (`transcript.jsonl`),
which is unchanged and is where an audit was always supposed to read from. So
the upgrade is a pin bump in the two places that hold it and no config change.

The pin stays. Under `1.x` a caret range would now mean what it says, and the
argument against it is the one the `1.0.0` addendum made: this pipeline runs
unattended, holding a write-scoped PAT, and a release nobody read arrives on a
machine nobody is watching.

## Addendum — 2026-09-18, at `2.0.0`

The first major, and the release the whole argument was written for: the notes
had to be read before the pin moved, because this one changes what a run is
allowed to do.

`2.0.0` adds a third **gating** trajectory invariant, `commit-before-stop`. A
run whose transcript carries no `git commit` no longer closes as a success — it
re-enters the inner loop carrying the violation, or lands `agent:blocked` when
`MAX_ITERATIONS` is spent. It comes from a sibling pipeline where an agent
implemented an issue, passed the gate, and then ended its turn waiting for a
backgrounded browser run to report; a headless spawn has no turn after that one,
so the working tree went in the bin and the branch kept the handoff commit and
nothing else. Two gating invariants watched it happen: `gate-before-commit`
passes _vacuously_ with no commits, and `red-before-green` grades
`not-evaluable` with no first commit to measure against.

**Breaking in two ways, and only one reaches here.** `TrajectoryInvariantId` and
`GatingTrajectoryInvariantId` each gain a member, so an exhaustive `switch` over
either stops compiling — `run-trajectory-check.ts` is this repo's only
TypeScript consumer of the package, it calls `runTrajectoryCheck` and prints
what comes back, and it switches on nothing. The behavior change is the half
that lands, and it is the half we want.

It should not fire here. `agent/implement/prompt.md` has carried a **HEADLESS**
section since the pipeline was built — commit once the gate is green, do not
wait for approval, do not ask questions — which is exactly the instruction the
sibling pipeline's prompt was missing. What that section did not cover is
waiting on a _background command_ rather than on a human, so the prompt now says
that too, and `2.0.0` is the backstop underneath it rather than the fix.

`2.0.0` also repins its bundled skills plugin to `galosandoval/skills#v2.0.0`,
whose `/implement` no longer ends on "wait for the user to approve the work
before committing" — an instruction with no one to satisfy it in an unattended
run. Skills reach the agent through the CLI's own `--plugin-dir` discovery, so
that arrives with the package and needs no config here.

The pin stays, and a major is the easiest version of this argument to make.

# Agent pipeline setup (issue → draft PR)

Setup notes for the AI issue → draft PR pipeline (PRD: #507). This slice (#508) lays
the repo plumbing; the workflow + agent come in later slices. Everything below is a
**maintainer action** — the values are not set by the agent.

## Quality-gate scripts

The gate is one `package.json` script, so a human and the harness run the same
thing by construction:

- `bun run gate` → `bun run typecheck && bun run lint && bun run test`

`run-policy.ts`'s `GATE_COMMAND` names that script rather than restating the
three commands, and `run-policy.test.ts` fails if the script stops existing.
Its parts, and the formatter beside them:

- `bun run typecheck` → `tsc --noEmit`
- `bun run lint`, `bun run test`
- `bun run format` → `prettier --write .` (idempotent; respects `.prettierignore`)

## The loop (`@galosandoval/shopfloor` 1.0.0, #637)

`.github/workflows/agent-implement.yml` is two jobs. `admit` installs nothing and
answers "may this event start a run?" — classification, the spend gate, the
in-flight check, the attempt ceiling. `run-phase` does this repo's setup (pgvector
service, `bun install`, the pinned Claude CLI, `gen` / `migrate:deploy` / `seed`,
the Playwright browser) and then runs **one** step: `shopfloor-run-phase`. The
branch, the draft PR, the issue's labels, the verify comment, the handoff trail,
and every terminal transition live inside that verb.

The loop has two edges:

- **Human** — someone adds **`ready-for-agent`** to a leaf issue. That label, not
  `agent:implement`, is what starts a run; `agent:implement` says which _phase_
  owns the issue once one does.
- **Machine** — the `Test` workflow completes red on an `agent/issue-<N>` branch.
  The next attempt is spawned with a written handoff from the previous one. It is
  fenced three ways inside the package: same repository (not a fork), head commit
  authored by `claude-code[bot]`, and no `Shopfloor-Loop: closed` trailer on that
  commit. `test.yml` runs on pushes to `agent/**` for this reason — a failed
  attempt pushes its handoff commit without opening a PR, and without a push
  trigger CI would never run on it.

Both edges depend on `AGENT_PAT`: a push made with `GITHUB_TOKEN` fires no
downstream event, so the loop would run once and stop. `workflow_run` also fires
only from a workflow file on the **default branch**, so the machine edge stays
dead until this file is on `main`.

## Labels

The vocabulary is owned by the package (six names, fixed) and created by
`shopfloor init`:

- `ready-for-agent` — the entry label. Adding it is the go/spend trigger, and
  re-adding it is how a human retries.
- `ready-for-human` — every terminal outcome sets it, from an exhaustive
  transition table. (Before 1.0.0 this swap sat behind `|| true` against a label
  that did not exist, and had never once fired.)
- `agent:implement` — the implement phase owns this issue.
- `agent:in-progress` — a run is in flight; its `labeled` timeline events are
  also how the attempt ceiling is counted.
- `agent:blocked` — a run refused or something is broken; a human must unblock.
- `agent:exhausted` — the attempt ceiling (3) was spent with the gate still red.
  The accumulated trail is posted once, as one comment.

## Run policy

`agent/implement/run-policy.ts` is the single contract: model, turn cap, both
runaway budgets, the CLI pin, the gate command, the iteration ceiling, and the
required-env list. The workflow states none of them itself — one step writes
`bun agent/implement/run-policy.ts github-env` into `$GITHUB_ENV`, which is where
the harness reads them.

The gate the harness runs after every spawn is `bun run gate`
(typecheck + lint + test). On a red gate it respawns
with the failing command and a tail of its output appended to the prompt, up to
`MAX_ITERATIONS`, all sharing the one wall-clock budget. `test:e2e` is
deliberately not in the gate — verify is best-effort and must never fail a run.

A green gate is necessary but no longer sufficient: the run's trajectory is
graded from its transcript, and an attempt that committed before its gate passed
or never went red before green re-enters the loop or lands `agent:blocked`. A
missing or unreadable transcript blocks the run too.

The verb grades that scorecard but posts it nowhere, so one step after it —
`bun agent/implement/run-trajectory-check.ts` — renders the same grade as a PR
comment (#566). Advisory and best-effort: it never fails a run, and a missing
transcript degrades to "no scorecard".

There is no local rehearsal of any of this. `agent/local/` was retired with the
`1.0.0` upgrade — see [ADR 0003](../adr/0003-retire-the-local-agent-rehearsal.md).

## End-to-end harness + verify phase (#523)

The pipeline gains a **Playwright e2e harness** and the agent's **verify phase**.

### Playwright harness

- `playwright.config.ts` (repo root) boots the built app via its `webServer`
  block (`bun run build && bun run start`), points `baseURL` at it, and captures
  screenshots/trace/video as proof.
- Specs live in a top-level **`e2e/`** directory. This is a deliberate,
  documented exception to the repo's "tests are colocated, no `__tests__/`"
  convention — e2e specs span features and don't belong beside a single prod
  file. Unit/integration tests stay colocated.
- `e2e/auth.setup.ts` logs in once as the seeded user (`alice@prisma.io`) and
  saves a `storageState` every spec reuses, so no spec re-scripts login/boot.
- Run locally with `bun run test:e2e` (or `bun run test:e2e:ui`). It is **not**
  part of the default `bun run test` gate, so the unit/integration gate and the
  agent's per-commit loop stay fast and never boot a browser. Jest is configured
  to ignore `e2e/` (its specs also match `*.spec.ts`).
- The seeded user's password is bcrypt-hashed in `prisma/seed.ts` (and the user
  gets an empty `list`), so the seeded login works through the real Credentials
  provider. Both the agent verify phase and the PR `e2e` job seed the DB before
  the browser run (`bun run seed`).

### Agent verify phase

Part of the phase the harness runs. After the green-gate commits and before the
draft PR:

1. The agent (see `prompt.md`'s VERIFY section) judges UI-verifiability from the
   acceptance criteria.
2. If UI-verifiable: writes a durable `e2e/` spec, re-seeds, runs
   `bun run test:e2e`, captures screenshots into `.agent/verify/issue-<N>/`, and
   commits the spec + PNGs. The PNGs are committed on purpose so they get a raw
   URL to render inline in the PR comment (see below) — they don't stay
   committed past that.
3. Writes a verify report to `OUTPUT_DIR/verify_report.md` (outside the repo,
   like `pr_description.txt`).

The harness pushes the branch, opens the draft PR, and posts one **PR** comment
(report + inline screenshots + run link) — not on the issue, since the issue
already links the PR via `Closes #N`. Verify is **best-effort**: a failed
boot/browser run never fails the run or loses the green implement commits; the
comment says verification couldn't complete and why.

Screenshot URLs are pinned to the push commit's **SHA**, not the branch name, so
stripping the PNGs afterwards leaves the images rendering. Stripping them is
still the workflow's job, not the harness's: 1.0.0's cleanup commit removes only
its own attempt trail (`run-phase.ts` says so in as many words — "Nothing strips
the verify screenshots yet"), so `agent-implement.yml` keeps a "Strip verify
screenshots off the branch tip" step. That commit carries the
`Shopfloor-Loop: closed` trailer, without which its own CI run going red would
read as another failed attempt and spend one. The `e2e/` spec itself is not
stripped; it's meant to stay.

### PR e2e gate

`.github/workflows/test.yml` adds a `changes` job (dorny/paths-filter) and an
`e2e` job that runs **only when backend code changed** (`src/server/**`,
`prisma/**`, `e2e/**`, `playwright.config.*`). Docs/config/pure-styling PRs skip
it. The `e2e` job needs `NEXTAUTH_SECRET` + `OPENAI_API_KEY` (already required
secrets) to boot the app; a real misconfig fails it loudly.

## Required repo secrets

Set these under **Settings → Secrets and variables → Actions → Repository secrets**.

| Secret                    | Purpose                                                                                                                                                                                                                                                 | How to generate                                                                                                                                         |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CLAUDE_CODE_OAUTH_TOKEN` | Auth for Claude on the runner. Subscription / flat-rate — **not** `ANTHROPIC_API_KEY` (no metered usage).                                                                                                                                               | Run `claude setup-token` locally and paste the emitted token.                                                                                           |
| `AGENT_PAT`               | Push branches, open PRs, edit issue labels, and touch `.github/workflows/`. Needed because GitHub does **not** fire downstream workflows from `GITHUB_TOKEN`-driven label events, and pushing under `.github/workflows/` requires the `workflow` scope. | GitHub → Settings → Developer settings → **Fine-grained PAT** scoped to this repo with **Contents, Pull requests, Issues, Workflows = Read and write**. |
| `NEXTAUTH_SECRET`         | Required by app/suite code paths the agent may exercise during TDD.                                                                                                                                                                                     | `openssl rand -base64 32`                                                                                                                               |
| `OPENAI_API_KEY`          | Required by app/suite code paths (AI features) the agent may exercise.                                                                                                                                                                                  | Existing project OpenAI key, or generate a new one in the OpenAI dashboard.                                                                             |

> The Postgres + pgvector service container that backs integration tests is provided by
> the workflow (same pattern as `.github/workflows/test.yml`) — no secret needed for it.

## Generating `AGENT_PAT` (step by step)

`AGENT_PAT` is a **fine-grained personal access token**, not a classic token. It must be
generated by an account with admin rights on `galosandoval/recipe-chat` (the maintainer).

1. Go to **GitHub → your avatar → Settings → Developer settings → Personal access
   tokens → Fine-grained tokens** (or open https://github.com/settings/personal-access-tokens/new).
2. Click **Generate new token**.
3. **Token name:** something identifiable, e.g. `recipe-chat-agent-pipeline`.
4. **Expiration:** pick a finite window (90 days is GitHub's max for the picker; "custom"
   allows up to 1 year). Set a calendar reminder — when it expires the pipeline stops
   pushing/opening PRs until you regenerate and re-paste the secret.
5. **Resource owner:** select the account/org that owns the repo (`galosandoval`).
6. **Repository access:** choose **Only select repositories** → pick **`recipe-chat`**.
   Do _not_ grant "All repositories" — keep the blast radius to this one repo.
7. **Permissions → Repository permissions**, set each of these to **Read and write**
   (leave everything else at "No access"):
   - **Contents** — push the `agent/issue-<N>-<slug>` branch.
   - **Pull requests** — open the draft PR.
   - **Issues** — flip the `agent:*` labels and post the blocked comment.
   - **Workflows** — required to push changes that touch `.github/workflows/`.
8. Click **Generate token** and **copy the value immediately** — GitHub shows it only once.
9. Add it as a repo secret: **repo → Settings → Secrets and variables → Actions → New
   repository secret**, name **`AGENT_PAT`**, paste the value. (Or via CLI:
   `gh secret set AGENT_PAT --repo galosandoval/recipe-chat` and paste when prompted.)

**Why a PAT and not the built-in `GITHUB_TOKEN`?** GitHub deliberately does **not** fire
downstream workflows from events (like label changes) that `GITHUB_TOKEN` triggered — so
a token-driven label event wouldn't start the agent run. The PAT also carries the
`workflow` scope `GITHUB_TOKEN` can't grant for pushing under `.github/workflows/`.

**Rotation:** if the token leaks or expires, regenerate it (steps 1–8) and overwrite the
secret (step 9). No code change is needed — the workflow reads it by name.

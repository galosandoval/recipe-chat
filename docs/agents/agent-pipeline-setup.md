# Agent pipeline setup (issue → draft PR)

Setup notes for the AI issue → draft PR pipeline (PRD: #507). This slice (#508) lays
the repo plumbing; the workflow + agent come in later slices. Everything below is a
**maintainer action** — the values are not set by the agent.

## Quality-gate scripts

The pipeline's quality gate depends on these `package.json` scripts (added in this slice):

- `bun run typecheck` → `tsc --noEmit`
- `bun run format` → `prettier --write .` (idempotent; respects `.prettierignore`)

Plus the existing `bun run lint` and `bun run test`.

## Labels

The pipeline state machine uses these labels (created in this slice):

- `agent:implement` — maintainer go/spend trigger; added to a ready leaf issue.
- `agent:in-progress` — set while the agent runs; always cleared on completion.
- `agent:blocked` — run refused or failed; see the issue comment for the reason.

`ready-for-agent` / `ready-for-human` (pre-existing) are the upstream triage labels. On a
successful run, `ready-for-agent` is swapped for `ready-for-human` when the draft PR opens,
signaling the issue now needs human review/merge.

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

Appended to the existing `implement` job (no new job/workflow/label/secret).
After the green-gate commits and before the draft PR:

1. The agent (see `prompt.md`'s VERIFY section) judges UI-verifiability from the
   acceptance criteria.
2. If UI-verifiable: writes a durable `e2e/` spec, re-seeds, runs
   `bun run test:e2e`, captures screenshots into `.agent/verify/issue-<N>/`, and
   commits the spec + PNGs. The PNGs are committed on purpose so they get a raw
   URL to render inline in the PR comment (see below) — they don't stay
   committed past that.
3. Writes a verify report to `OUTPUT_DIR/verify_report.md` (outside the repo,
   like `pr_description.txt`).

The workflow pushes the branch (capturing that push's commit SHA), opens the
draft PR, then runs `post-verify.ts`, which builds one **PR** comment (report +
inline screenshots + run link via the pure `verify-comment.ts` helper) and
posts it with `gh pr comment` — not on the issue, since the issue already links
the PR via `Closes #N`. Verify is **best-effort**: a failed boot/browser run
never fails the run or loses the green implement commits; the comment says
verification couldn't complete and why.

Screenshot URLs are pinned to the push commit's **SHA**, not the branch name.
Immediately after the comment step, a "Strip verify screenshots off the branch
tip" step removes `.agent/verify/issue-<N>/` in a follow-up commit and pushes
it. Because the PR comment's URLs are SHA-pinned, the images keep rendering
even though the branch tip (and eventually `main`) no longer carries the PNGs.
The `e2e/` spec itself is not stripped — it's meant to stay.

### PR e2e gate

`.github/workflows/test.yml` adds a `changes` job (dorny/paths-filter) and an
`e2e` job that runs **only when backend code changed** (`src/server/**`,
`prisma/**`, `e2e/**`, `playwright.config.*`). Docs/config/pure-styling PRs skip
it. The `e2e` job needs `NEXTAUTH_SECRET` + `OPENAI_API_KEY` (already required
secrets) to boot the app; a real misconfig fails it loudly.

## Local Docker rehearsal (`agent:local`, #541)

`bun run agent:local -- <issue-number>` runs the whole `agent:implement`
pipeline locally inside Docker — a faithful CI rehearsal (full quality gate +
verify/e2e) fully isolated from the host, with no GitHub side effects. See
`agent/local/run.sh` (host-side orchestration) and `agent/local/entrypoint.sh`
(the in-container flow) for the mechanics; this section covers maintainer
setup.

### What it does

1. Reads the issue's title via `gh` (using the maintainer's own already-logged-in
   token — no new secret to provision, and it's never used to push).
2. Brings up an ephemeral `pgvector/pgvector:pg16` service, created fresh and
   torn down every run.
3. Clones the host repo's **git history only** (never the working tree) into
   the container, checks out `main`, and cuts `agent/local-<timestamp>`.
4. Runs the shared setup (#539: `bun run gen && bun run migrate:deploy && bun
run seed`) and the shared orchestrator (#540: `agent/implement/implement.ts`)
   with the full quality gate plus the verify/e2e phase.
5. Pushes the resulting branch back into the host repo's `.git` and tears the
   database down. The host's working tree and current branch are never
   touched — only a new branch ref appears, for you to inspect with
   `git log agent/local-<timestamp>`.

No draft PR, no label changes, no `gh pr create` / `gh issue edit` — the
agent's own prompt already forbids opening a PR or closing the issue, and the
local scripts never call any GitHub write command either.

### Setup

- **Docker** (with Compose v2) running locally.
- **`CLAUDE_CODE_OAUTH_TOKEN`** exported in your shell (same subscription
  token as the CI secret — run `claude setup-token`).
- **`gh auth login`** done on the host (its token is forwarded in for reads
  only; see "How local `gh` reads work" below).
- **`NEXTAUTH_SECRET`** / **`OPENAI_API_KEY`** — picked up from your shell env
  if exported, otherwise pulled straight out of the repo's local `.env` (the
  rest of `.env` — prod DB URL, Stripe keys — is never sourced or forwarded).
- **Coding standards** — if `~/Projects/skills/rules` exists (this repo's
  convention, see `docs/agents/domain.md`), it's mounted read-only and the
  agent conforms to it, same as CI. Absent, the prompt's standards step is
  skipped, same as CI's empty-`STANDARDS_DIR` case. Override the path with
  `LOCAL_STANDARDS_DIR`.
- **Runaway guards** — `--max-turns 150` (shared with CI) plus a local
  45-minute wall-clock cap and a 10-minute idle cap (`LOCAL_WALL_CLOCK_MINUTES`
  / `LOCAL_IDLE_MINUTES`), since there's no GitHub Actions workflow timeout to
  fall back on locally.

### How local `gh` reads work

`gh` has no true anonymous mode — even public-repo reads need a token. Rather
than provision a separate secret for local-only use, `run.sh` forwards the
maintainer's own `gh auth token` into the container as `GH_TOKEN`. It's used
exclusively for reads (the issue view at the top of the run, and whatever the
agent itself reads via `gh` while exploring): nothing in the local scripts or
the agent's prompt ever calls a `gh` write command, so despite the token
technically being able to push, the local rehearsal never does.

### CI is unchanged

None of the above touches CI: `.github/workflows/agent-implement.yml` still
installs tools per step, no Docker, no published image, same `AGENT_PAT` /
`CLAUDE_CODE_OAUTH_TOKEN` secrets. `agent/local/` exists only for this local
path.

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

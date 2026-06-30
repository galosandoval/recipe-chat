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

`ready-for-agent` (pre-existing) stays as the upstream human-triage state and costs nothing.

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
   commits the spec + PNGs. The PNGs are committed on purpose so they get raw
   URLs and render inline on the issue.
3. Writes a verify report to `OUTPUT_DIR/verify_report.md` (outside the repo,
   like `pr_description.txt`).

The workflow then pushes the branch and runs `post-verify.ts`, which builds one
issue comment (report + inline screenshots + run link via the pure
`verify-comment.ts` helper) and posts it with `gh issue comment`. Verify is
**best-effort**: a failed boot/browser run never fails the run or loses the green
implement commits; the comment says verification couldn't complete and why.

> **Trade-off:** committed PNGs under `.agent/verify/issue-<N>/` merge into
> `main` unless stripped before merge — clearly named and outside the app bundle
> so they're trivial to drop in a squash. The `e2e/` spec is meant to stay.

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

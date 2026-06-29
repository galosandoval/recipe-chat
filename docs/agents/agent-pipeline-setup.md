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

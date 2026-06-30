# Playwright e2e harness + agent verify phase

The end-to-end harness and the `agent:implement` **verify phase** (PRD: #523).
The harness is the foundation; the verify phase is built on top of it. Screenshots
are a side effect of running a real, durable test — not a throwaway script.

## The harness

- **`playwright.config.ts`** (repo root) — a `webServer` block that builds + boots
  the app (`bun run build && bun run start`) and waits for it, a base URL, screenshot/
  trace/video capture, and two projects: a `setup` project that logs in once and a
  `chromium` project that reuses that session.
- **`e2e/`** (top-level) — the specs. A deliberate, documented exception to the
  repo's "tests are colocated, no `__tests__/`" convention, because e2e specs span
  features. See the note in `CONTEXT.md`.
  - `e2e/auth.setup.ts` — logs in as the seeded user (`alice@prisma.io` /
    `Admin@123` from `prisma/seed.ts`) and saves `storageState` to
    `e2e/.auth/user.json` (gitignored).
  - `e2e/verify.ts` — `verifyDir()` / `screenshotPath()`, which resolve to
    `.agent/verify/issue-<N>/` when `VERIFY_ISSUE` is set (else `.agent/verify/local/`).
  - `e2e/chat.spec.ts` — example authenticated spec and the template the agent follows.
- **Scripts** — `bun run test:e2e` (and `test:e2e:ui`). **Not** part of the default
  `bun run test` gate, so the unit/integration loop stays fast and the agent's
  per-commit loop never boots a browser.

Run locally: `bun run seed` (once, against your dev DB), then `bun run test:e2e`.

## The verify phase (`agent:implement`)

Appended to the existing `implement` job in `.github/workflows/agent-implement.yml`,
after the green-gate commits and before the draft PR. It reuses the implement
phase's isolation, service DB, and token model — no new job, label, or secret.

The workflow adds (before the agent) a `bun run seed` step and a
`bunx playwright install --with-deps chromium` step. The agent's `prompt.md` gains
a VERIFY section: it judges UI-verifiability from the acceptance criteria, and if
UI-verifiable, writes a durable `e2e/` spec, runs `VERIFY_ISSUE=<N> bun run test:e2e`,
commits the spec + the PNGs under `.agent/verify/issue-<N>/`, and writes a verify
report to `OUTPUT_DIR/verify_report.txt`. Backend-only issues skip the browser work
and the report says so.

After **Push branch** (so raw URLs resolve), the workflow runs
`.sandcastle/implement/post-verify-comment.ts`, which reads the report + the committed
screenshots and posts a single issue comment with the PNGs rendered inline and a link
to the workflow run. The markdown/URL assembly is the pure, unit-tested
`verify-comment.ts` (`verify-comment.test.ts`); `gh` and the filesystem stay at the edge.

**Best-effort, never fatal.** Verify never fails the implement run: a missing report
posts a "couldn't verify" note, and green implement commits still ship.

## CI gate

`.github/workflows/test.yml` has a path-filtered `e2e` job (via `dorny/paths-filter`)
that runs only when backend code changed — `src/server/**`, `prisma/**`, `e2e/**`,
`playwright.config.*`. It seeds the DB, installs Chromium, and runs `test:e2e`. Unlike
the agent verify phase, a real misconfig here fails the PR loudly. PRs touching only
docs, config, or pure-frontend styling skip it.

## Trade-offs / follow-ups

- **Committed PNGs** under `.agent/verify/issue-<N>/` merge into `main` unless stripped
  before merge (clearly named so they're trivial to drop in a squash). Hosting them
  off-repo is a follow-up.
- The durable `e2e/` spec is **meant** to stay — that's the lasting-value difference
  from a throwaway script.
- Single headless Chromium at a default viewport; no cross-browser/responsive matrix,
  no visual regression / pixel diffing.

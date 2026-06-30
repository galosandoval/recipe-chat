# TASK

Implement issue #{{ISSUE_NUMBER}}: {{ISSUE_TITLE}}

You are on branch `{{BRANCH}}`, already created from `main`. Pull the issue
in full with its discussion:

```
gh issue view {{ISSUE_NUMBER}} --comments
```

If the issue references a parent PRD or blocking issues, pull those in too
(`gh issue view <N> --comments`) so you understand the intended slice and scope.

# HEADLESS — there is no human in this loop

This run is fully autonomous. Nobody will review interactively or approve steps.

- Do the work and **commit it yourself** once the quality gate is green.
- Do **not** wait for approval and do **not** ask questions — decide and proceed.
- Do **not** close the issue and do **not** open the PR — the workflow does that.
- Stay within the issue's scope. If a blocker makes the issue impossible, stop
  and explain why in the PR description file (final step) rather than guessing.

# CONTEXT

Before changing anything, read the project's domain docs if they exist:

- `CONTEXT.md` at the repo root (the glossary / ubiquitous language).
- Relevant ADRs under `docs/adr/`.

If those files don't exist, proceed silently — don't flag their absence.

Then explore the area you'll change and fill your context with the relevant
parts. **Tests are colocated** — the test file sits directly beside the prod
file (no `__tests__/` directories). Read the colocated tests around the code
you'll touch; they show the established patterns to follow.

# CODING STANDARDS

If `{{STANDARDS_DIR}}` is non-empty and exists, read the markdown files in it
before writing code and conform to the ones relevant to the languages you're
changing (each file's `paths` frontmatter says which files it governs). They are
the project owner's TypeScript / React / Prisma conventions — treat them as
binding. If `{{STANDARDS_DIR}}` is empty or missing, proceed without it.

# DATABASE

A Postgres + pgvector database is already running and migrated. The integration
suite connects via `DATABASE_PRISMA_URL` / `DATABASE_URL_NON_POOLING` (already
set in the environment). The Prisma client is generated and all migrations are
applied. If your change needs a schema change, create the migration with
`bunx prisma migrate dev --name <name>` (never `db push`), then continue.

# EXECUTION — test-driven

Use red-green-refactor:

1. **RED** — write one failing test that pins the next piece of behavior.
2. **GREEN** — write the minimum code to make it pass.
3. **REPEAT** until the issue's acceptance criteria are met.
4. **REFACTOR** — clean up with the tests green.

Backend / Node tests need the `@jest-environment node` docblock at the top of
the test file (the default environment is jsdom).

# QUALITY GATE — run before every commit, fix and rerun until clean

Everything is Bun (`bun install`, `bunx …`, `bun run …`). Run, in order:

1. `bun run typecheck`
2. `bun run lint`
3. `bun run format`
4. `bun run test`

If any step fails, fix the cause and rerun the whole gate from the top. Only
commit when all four pass.

# COMMIT

Make one or more commits on `{{BRANCH}}` with conventional-commit messages
(`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`). Keep commits
focused. Do not amend or force-push; just add commits.

# VERIFY — prove it works in the browser (best-effort, never blocks)

After your green-gate commits, before writing the PR description, prove the
change works for a user. This phase is **best-effort**: if anything here fails,
capture what you can, write the report, and move on — never let verify fail the
run or discard your implementation commits.

1. **Judge UI-verifiability.** From the issue's acceptance criteria, decide
   whether this change is observable in the running app (a screen renders, an
   interaction works). Backend-only, infra, or tooling changes are **not**
   UI-verifiable.

2. **If NOT UI-verifiable:** skip the browser work entirely. Write a short report
   to `{{VERIFY_REPORT_FILE}}` saying so — e.g. "Not UI-verifiable (backend-only);
   verified via the unit/integration suite." Do not capture screenshots. Done.

3. **If UI-verifiable:**
   - Write (or extend) a **durable Playwright spec** under `e2e/` that exercises
     the issue's user flow. This is a real, lasting regression test — not a
     throwaway. Use the shared auth fixture (`storageState`) and `webServer` boot
     from `playwright.config.ts`; do **not** re-script login or app boot. Follow
     the pattern in `e2e/chat.spec.ts` and capture the final state of each
     user-facing acceptance criterion with `page.screenshot()` into the verify
     directory via `screenshotPath(...)` from `e2e/verify.ts` (it resolves to
     `.agent/verify/issue-{{ISSUE_NUMBER}}/` when `VERIFY_ISSUE` is set).
   - Run it: `VERIFY_ISSUE={{ISSUE_NUMBER}} bun run test:e2e`. Playwright builds +
     boots the app against the seeded DB and captures the screenshots.
   - **Commit** the new/updated spec under `e2e/` **and** the PNGs under
     `.agent/verify/issue-{{ISSUE_NUMBER}}/` onto the branch (they need to be
     committed so the workflow can render them inline via raw URLs).
   - Write a short report to `{{VERIFY_REPORT_FILE}}`: what flow you checked, the
     verdict, and one line per screenshot mapping it to an acceptance criterion.

4. **If the browser run errors** (app won't boot, spec throws): capture whatever
   evidence you can (a failure-state screenshot if the page loaded at all),
   commit it, and write a report explaining what failed and why. Do not fail the
   run.

The `{{VERIFY_REPORT_FILE}}` lives outside the repo (like the PR description);
the workflow reads it back and posts it on the issue with the screenshots inline.

# FINAL STEP — write the PR description

As the very last thing, write a short PR description (plain markdown) to the
absolute path `{{PR_DESCRIPTION_FILE}}`. **Do not commit this file** — it lives
outside the repo and the workflow reads it to build the PR body.

Cover, briefly:

- What you changed and why (tie it to the issue's acceptance criteria).
- How it's tested (the new/updated tests).
- Anything a reviewer should know (trade-offs, follow-ups, anything skipped).

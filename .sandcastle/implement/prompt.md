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

# FINAL STEP — write the PR description

As the very last thing, write a short PR description (plain markdown) to the
absolute path `{{PR_DESCRIPTION_FILE}}`. **Do not commit this file** — it lives
outside the repo and the workflow reads it to build the PR body.

Cover, briefly:

- What you changed and why (tie it to the issue's acceptance criteria).
- How it's tested (the new/updated tests).
- Anything a reviewer should know (trade-offs, follow-ups, anything skipped).

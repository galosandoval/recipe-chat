# Data migrations

Some schema migrations need a companion **data migration** — a script that backfills
or reshapes existing rows. A `data-migration.ts` file inside a migration folder is
picked up and run after `prisma migrate deploy` in CI by the ledger-tracked runner
(`prisma/run-data-migrations.ts`, introduced in issue #486).

## The one rule: every `data-migration.ts` must be idempotent

The runner records a migration as applied **only on exit 0**. A migration that fails (or
a job that is cancelled/times out) re-runs on the next push. A re-run job, or a manual
re-invocation, must never corrupt data. Therefore:

1. **Filter to unprocessed rows only.** Guard every write with `WHERE <field> IS NULL` /
   `NOT EXISTS (...)`. Never blind-rewrite the whole table.
2. **A second run against an already-migrated DB is a no-op.** This falls out of (1):
   once every row is processed the guard matches nothing.
3. **Fail fast, and verify when a write can fail silently.** Abort (`process.exit(1)`)
   before doing work if a required env/API key is missing. When the write can fail without
   throwing — e.g. an external API call (embeddings) that swallows errors — re-count the
   unprocessed rows afterward and exit non-zero if nothing landed, so the runner does not
   record a false success. A plain SQL `UPDATE` throws on failure and needs no verify step.

Deterministic transforms (e.g. `slugify(name)`) are not automatically safe: a re-run will
clobber values a user has since edited. Guard them too — only touch rows that still hold
the original/default value.

## How the runner picks these up

The runner (see issue #486) scans `prisma/migrations/*/data-migration.ts`, sorts by folder
name (timestamp order), and runs each one not yet in the `_data_migrations` ledger exactly
once. A non-zero exit stops the job; the migration stays unrecorded and re-runs next push.

## Writing a new one

Copy [`data-migration.template.ts`](./data-migration.template.ts) into your migration
folder and fill in the guard + transform. The marked **idempotency seam**
(`findUnprocessed`'s guard) is the part you must get right.

Reference implementation:
[`20260623000000_backfill_recipe_embeddings/data-migration.ts`](./20260623000000_backfill_recipe_embeddings/data-migration.ts)
— `NOT EXISTS` guard, env fail-fast, batched, post-run verify.

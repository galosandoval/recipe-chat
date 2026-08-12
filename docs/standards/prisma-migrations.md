# Prisma Migrations

## Workflow

- Always use `bunx prisma migrate dev --name <name>` to create a migration —
  never write migration files manually from scratch or apply SQL directly to the
  DB.
- After generating a migration, you can (and should) edit the SQL manually if
  needed (e.g. add `IF EXISTS`, data backfills, custom indexes).
- Use `prisma migrate resolve --applied <migration-name>` only when a migration
  was applied to the DB outside of Prisma (fixes the `_prisma_migrations`
  discrepancy without re-running SQL).

## Key behaviors

- `migrate dev` creates a migration AND applies it; it also regenerates the
  Prisma client.
- `migrate deploy` (used in CI/prod) only applies pending migrations — it does
  NOT detect drift or generate new ones.
- Removing a model from `schema.prisma` does NOT auto-generate a drop migration
  — run `migrate dev` to generate the `DROP TABLE` SQL, then edit it with
  `IF EXISTS` for safety before applying.
- `db push` skips the migration history entirely — never use it here. The schema
  only ever changes through migration history, and the agent run's command guard
  blocks it outright.

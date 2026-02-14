# Ingredient Schema Refactor (Issue #406)

## Strategy: Expand then Contract

We use **expand then contract** so we can ship the new fields safely and remove the legacy column only after everything is migrated.

### Expand (first migration)

- **Add** new columns to `Ingredient`: `quantity`, `unit`, `unit_type`, `item_name`, `preparation`, `raw_string`.
- **Keep** the existing `name` column unchanged.
- All new code should:
  - Prefer the new structured fields when present.
  - Fall back to `name` for display when structured fields are null (legacy or unparsed rows).
- Backfill `raw_string = name` in the same migration so new code can use `raw_string` consistently while still supporting `name` for reads.

### Contract (later migration)

- After all writes use the new fields and backfill/parsing is complete, run a **separate migration** that:
  - Drops the `name` column (or renames it away).
- Only do this when no code paths depend on `name` and data has been migrated to `raw_string` (and structured fields where applicable).

### Summary

| Phase   | Migration        | `name` column   | New columns                    |
|---------|------------------|-----------------|--------------------------------|
| Expand  | Add columns only | Kept, unchanged | Added (nullable)               |
| Contract| Remove legacy    | Dropped         | Remain (primary for display)   |

This keeps the first migration low-risk and makes the removal of `name` an explicit, reversible step once we’re confident in the new schema.

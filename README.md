# RecipeChat

A conversational recipe assistant. You chat with it the way you'd chat with a cook — "something with the chicken thighs in my fridge, not too spicy" — and it streams back tailored recipe options, expands any of them into full ingredients and instructions, and helps you carry them through to a shopping list and pantry.

The interesting part isn't the chat. It's everything wired up behind it: a tool-calling LLM grounded in the user's saved recipes, taste profile, and pantry; a pgvector layer that de-duplicates suggestions semantically rather than by string match; and a tiered subscription model — all on a strictly layered, fully-typed stack.

## What it does

- **Grounded recipe generation** — the model is given the user's saved recipe titles, dietary filters, taste profile, and (optionally) current pantry contents as system context, then proposes diverse options via a constrained tool call. A second tool expands a chosen suggestion into full ingredients, instructions, and servings.
- **Semantic de-duplication** — newly generated options are embedded and compared against the user's existing recipes in Postgres (pgvector), so the LLM over-generates and the server returns only the genuinely novel survivors. Runs entirely off the model, fails open.
- **Pantry & shopping lists** — structured ingredients (quantity / unit / name) flow from recipes into a checkable list and a persistent pantry, with unit conversion and preferred-unit display.
- **Taste profile** — per-user preferences that further condition generation.
- **Subscriptions** — FREE / STARTER / PREMIUM tiers gated by feature, backed by Stripe with webhook-driven status sync.
- **Internationalization** — locale negotiation and translated UI.

## Architecture

End-to-end type safety from the database to the React component, with a deliberate separation of concerns on the server.

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router), React 19 |
| Language | TypeScript, strict |
| API | tRPC 11 over React Query |
| Streaming AI | Vercel AI SDK + OpenAI (chat tool-calling & embeddings) |
| Data | PostgreSQL + Prisma 6, pgvector for embeddings |
| Auth | NextAuth (Auth.js) v5 |
| Payments | Stripe |
| UI | Tailwind 4, Radix primitives, Motion |
| State | Zustand + React Query |
| Validation | Zod (shared client/server schemas) |
| Tests | Jest (unit + integration), colocated |

The server is split into three layers, each calling only the one below it:

```
routers/         tRPC procedures — auth, input validation (Zod), response shaping
  └─ use-cases/      business logic — orchestration, the LLM/embedding workflows
       └─ data-access/   Prisma queries — the only layer that touches the DB
```

The streaming chat endpoint (`src/app/api/chat/route.ts`) lives outside tRPC because it returns a token stream, but reuses the same use-cases.

## Getting started

Requires Node 22 and [Bun](https://bun.sh).

```bash
bun install
```

Set the environment variables in `.env` (database URLs, OpenAI key, NextAuth secret, Stripe keys), then bring up the database and dev server:

```bash
./scripts/start-database.sh   # local Postgres in Docker
bun run push          # sync the Prisma schema
bun run dev           # http://localhost:3000
```

### Stripe (local)

Subscriptions need the Stripe CLI forwarding webhooks. Run two terminals:

```bash
bun run stripe:listen   # forwards webhooks to /api/webhooks/stripe
bun run dev
```

Full setup — env vars, test cards, troubleshooting — is in [docs/stripe-local-setup.md](docs/stripe-local-setup.md).

## Development

```bash
bun run typecheck         # tsc --noEmit
bun run lint              # next lint
bun run test              # full suite
bun run test:unit         # everything except the DB-backed suites
bun run test:integration  # tRPC routers against a real test DB
bun run studio            # Prisma Studio
```

Integration tests run against a dedicated database; set it up once with `bun run test:db:setup` (reads `.env.test.local`).

## Database & migrations

Schema lives in [`prisma/schema.prisma`](prisma/schema.prisma).

```bash
bun run migrate        # create + apply a migration locally
bun run migrate:prod   # deploy migrations to production
```

Some migrations ship a companion **data migration** (a `data-migration.ts` beside the schema migration) for backfilling existing rows — embeddings, structured ingredient fields, recipe slugs, and so on. They're exposed as `data-migration:*` scripts in `package.json` and discovered/run in order by `prisma/run-data-migrations.ts`.

## Repo conventions

- **Colocated tests** — test files sit beside the code they cover (no `__tests__` dirs).
- **Layered server** — routers never query the DB directly; they go through a use-case.
- **Shared schemas** — Zod schemas in `src/schemas` are the single source of truth for client and server.
- Project context and architectural decisions are documented under [`docs/`](docs/).

## License

See [LICENSE.txt](LICENSE.txt).

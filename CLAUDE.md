# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev              # Start Next.js dev server
npm run build            # prisma generate && next build
npm run lint             # ESLint
npm run test             # Jest
npm run test -- path     # Run a single test file
npm run test:watch       # Jest watch mode
npm run studio           # Prisma Studio (DB GUI)
npm run migrate          # Run Prisma migrations (uses .env.local)
npm run gen              # Regenerate Prisma client
npm run push             # Push schema changes to DB without migration
npm run seed             # Seed database
```

## Architecture

Next.js 15 App Router with tRPC, Prisma (PostgreSQL), and OpenAI streaming chat.

### Routing

All pages are under `src/app/[lang]/` for i18n (en, es). The `[lang]` param is handled by middleware that detects locale and redirects. API routes live in `src/app/api/` — tRPC at `/api/trpc`, streaming chat at `/api/chat`, auth at `/api/auth`.

### Server Layers (tRPC)

Three-layer pattern for backend logic:

1. **Routers** (`src/server/api/routers/`) — tRPC procedures. Use `protectedProcedure` (requires auth) or `publicProcedure`. Validate input with Zod schemas from `src/server/api/schemas/`.
2. **Use Cases** (`src/server/api/use-cases/`) — Business logic. Each extends or uses a base pattern from `use-case.ts`. Routers call use cases.
3. **Data Access** (`src/server/api/data-access/`) — Prisma queries. Each extends `DataAccess` base class which provides `this.prisma` and a `transaction()` helper.

### Client Data Fetching

- tRPC client: `import { api } from '~/trpc/react'` — provides typed React Query hooks (`api.recipes.getAll.useQuery()`, etc.)
- Type helpers: `RouterInputs` and `RouterOutputs` for inferring procedure types
- Client state: Zustand stores in `src/stores/` (chat, navigation, recipes)

### Forms

- `useAppForm(schema, { defaultValues })` — wraps React Hook Form with Zod resolver (`src/hooks/use-app-form.ts`)
- Generic form components in `src/components/form/form.tsx`: `<Form>`, `<FormField>`, `<FormTextarea>`, `<FormSelect>`, `<FormTogglebox>`
- Validation schemas in `src/schemas/`

### Auth

NextAuth v5 beta with credentials provider (email + password, bcrypt). Session includes `userId` and `listId`. JWT with 15-day expiry.

### AI Chat

Streaming endpoint at `src/app/api/chat/route.ts` using Vercel AI SDK + OpenAI. System prompt is built from user's filters, pantry items, and saved recipes (`src/constants/chat.ts`).

## Style Guidelines

- **Path alias:** `~/` maps to `./src/`
- **Component size:** Consider extracting at ~100–125 lines. Keep extractions in the same file unless reused elsewhere.
- **Function size:** Consider extracting at ~80 lines.
- **Code colocation:** Keep helpers, hooks, and sub-components near where they're used. Don't export until needed elsewhere.
- **Third-party wrapping:** Wrap third-party libraries in custom hooks for type safety and swappability (see `useAppForm`, `useTranslations` pattern).
- **Strict TS:** `noUncheckedIndexedAccess` is enabled.

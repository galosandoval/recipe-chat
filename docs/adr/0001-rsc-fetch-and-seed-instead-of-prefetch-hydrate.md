# ADR 0001 — Pages fetch in the RSC and seed the client cache; no `prefetch`/`HydrateClient`

Date: 2026-08-10
Status: Accepted
Issues: #545, #590 (and 781d64b, the `<Suspense>` band-aid)

## Context

Every authenticated page used tRPC's `createHydrationHelpers`: `await api.x.prefetch(...)` in the server component, wrapped in `<HydrateClient>`, with client components reading through `useSuspenseQuery`.

Unlike `useQuery`, `useSuspenseQuery` runs during the **server-render pass** of a client component. The hydration state does not warm the client cache in time for that pass, so it misses and issues a real HTTP request to `/api/trpc`. Server-side there is no browser to attach a cookie, and the client link (`src/trpc/react.tsx`) forwards none, so `protectedProcedure` answers `UNAUTHORIZED`.

The symptom is a runtime error overlay on page load. A `<Suspense>` boundary swallows the suspension but not the throw, so it looks like a routing/boundary problem and gets "fixed" by adding boundaries — which leaves the unauthenticated round trip on every load. We hit this on `/recipes/[slug]` (#545), then `/lists` (#590), and papered over a third instance with a boundary.

## Decision

1. **Pages fetch their data in the RSC**, where the session is available: `const list = await api.lists.byUserId({ userId })`.
2. **A colocated `*InitialDataProvider` client component seeds the query cache during render**, via `useSeedQueryCache` (`src/hooks/use-seed-query-cache.ts`), which runs the seed in a `useState` initializer — before children mount, on both passes.
3. **Seeding uses `utils.x.setData(...)`, not per-hook `initialData`.** React Query ignores `initialData` once the query already exists in the cache (e.g. a cache-only reader ran first).
4. **`src/trpc/server.ts` exports a plain `createCaller`, not `createHydrationHelpers`.** There is no `prefetch` and no `HydrateClient` to reach for — the pattern is banned at the type level rather than by convention or a lint rule.
5. **A dev-only link makes a violation loud**: `createServerRenderGuardLink` refuses any request issued during the server-render pass with a named `ServerRenderQueryError` that says what to do, instead of letting it come back as `UNAUTHORIZED`.

## Consequences

- Seed inputs must match the client query key exactly. `/recipes` had been prefetching `limit: 10` while the client asked for `limit: 12`, so the prefetch had never once been used; the constant now lives in `src/app/recipes/recipes-constants.ts` and both sides import it.
- A page that adds a new suspense-read query must extend that page's provider, or the query fetches on the client (in dev, it fails loudly first).
- Data flows through one visible path — RSC fetch → provider props → cache — instead of an implicit dehydrate/hydrate handoff, so the failure mode is a type error rather than a runtime one.
- The trade: no streaming/`Suspense`-driven progressive fill. Pages await their data before rendering. For these routes the data is small and the seed removes a loading flash, so this is a win.

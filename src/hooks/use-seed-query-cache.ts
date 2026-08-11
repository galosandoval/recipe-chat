'use client'

import { useState } from 'react'

/**
 * Writes server-fetched data into the client query cache **during render**, once
 * per mount, before any child of the calling component renders.
 *
 * This is how every page hands RSC-fetched data to its client tree (#545, #590).
 * The timing is load-bearing: client components that call `useSuspenseQuery` run
 * during the server-render pass, and on a cache miss they issue a real HTTP
 * request to `/api/trpc` that carries no session cookie, so `protectedProcedure`
 * answers `UNAUTHORIZED`. Seeding in an effect (or via `HydrateClient`) lands too
 * late to stop that request; seeding in a `useState` initializer runs before the
 * children mount, so the query resolves synchronously on both passes.
 *
 * Use `utils.x.setData(...)` inside `seed`, not a per-hook `initialData` — React
 * Query ignores `initialData` once the query already exists in the cache.
 */
export function useSeedQueryCache(seed: () => void) {
  // `useState`'s initializer runs exactly once per mount, during render.
  useState(seed)
}

/**
 * The `src/`-relative path segments that mark a suite as DB-backed.
 *
 * The one source for the boundary. {@link isDbBackedSuitePath} matches on these,
 * and `package.json`'s `test:unit`/`test:integration` split — which cannot
 * import this module (JSON) — encodes the same segments as `src/<segment>`
 * arguments. `db-backed-suite-path.test.ts` binds those scripts back to this
 * array, so adding a segment here is the single edit that keeps the predicate,
 * the CI split, and the advisory-lock boundary in `jest.setup.ts` in step.
 */
export const DB_BACKED_PATH_SEGMENTS = ['server/api', 'app/api'] as const

/**
 * Whether a Jest suite at `suitePath` hits the database (#648).
 *
 * The backend suites under `src/server/api/**` and the route-handler suites
 * under `src/app/api/**` connect to a real Postgres, so they must both
 * serialize behind the advisory lock (`jest.setup.ts`) and run in the DB-backed
 * `integration` CI job, never the DB-free `unit` one. This is the single
 * definition of that boundary: `jest.setup.ts` and
 * `.github/workflows/test.yml.test.ts` both call it so the serialization
 * boundary and the CI-split boundary cannot drift — a drift would let a suite
 * acquire the DB lock yet be classified DB-free, i.e. green in CI and red under
 * `bun run gate`.
 *
 * Normalizes `\` to `/` first so a Windows-style path matches the same as a
 * POSIX one.
 */
export function isDbBackedSuitePath(suitePath: string): boolean {
  const normalized = suitePath.replace(/\\/g, '/')
  return DB_BACKED_PATH_SEGMENTS.some((segment) =>
    normalized.includes(`/${segment}/`)
  )
}

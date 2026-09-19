import { isDbBackedSuitePath } from '~/lib/db-backed-suite-path'

/**
 * The one definition of "this suite hits the database" (#648).
 *
 * Two places must agree on this rule or the issue's failure mode returns:
 * `jest.setup.ts` serializes every DB-backed suite behind the Postgres advisory
 * lock, and `.github/workflows/test.yml.test.ts` keeps every DB-backed suite out
 * of the DB-free `unit` CI job. If those two boundaries drift, a suite acquires
 * the lock (needs a DB) yet is classified DB-free and runs in the no-service
 * job — green in CI, red under `bun run gate`. This pins the shared predicate so
 * neither copy can drift from the other.
 */
describe('isDbBackedSuitePath', () => {
  it('flags suites under src/server/api', () => {
    expect(
      isDbBackedSuitePath(
        '/repo/src/server/api/use-cases/lists-use-case.test.ts'
      )
    ).toBe(true)
  })

  it('flags route-handler suites under src/app/api', () => {
    expect(isDbBackedSuitePath('/repo/src/app/api/chat/tools.test.ts')).toBe(
      true
    )
  })

  it('leaves component suites DB-free', () => {
    expect(
      isDbBackedSuitePath('/repo/src/components/fab-stack/fab-stack.test.tsx')
    ).toBe(false)
  })

  it('does not treat non-api server code as DB-backed', () => {
    expect(isDbBackedSuitePath('/repo/src/server/db.test.ts')).toBe(false)
  })

  it('does not match app pages outside the api segment', () => {
    expect(isDbBackedSuitePath('/repo/src/app/chat/page.test.tsx')).toBe(false)
  })

  it('normalizes Windows path separators before matching', () => {
    expect(
      isDbBackedSuitePath('C:\\repo\\src\\server\\api\\router.test.ts')
    ).toBe(true)
  })
})

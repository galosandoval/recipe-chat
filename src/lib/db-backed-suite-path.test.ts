import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  DB_BACKED_PATH_SEGMENTS,
  isDbBackedSuitePath
} from '~/lib/db-backed-suite-path'

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

/**
 * `package.json`'s `test:unit`/`test:integration` split encodes the same DB
 * boundary as the predicate, but as literal path arguments — and JSON cannot
 * import this module. If the predicate gains a segment and the scripts don't
 * follow, a suite under the new segment runs in the DB-free `unit` CI job:
 * green under `bun run gate` (a DB is present locally), red in CI. These bind
 * the scripts to {@link DB_BACKED_PATH_SEGMENTS} so `--listTests` parity
 * (`test.yml.test.ts`) is not the only thing standing between the two — this
 * catches the drift even before a suite under the new segment exists.
 */
describe('DB_BACKED_PATH_SEGMENTS is the one source for the package.json split', () => {
  const packageJson = JSON.parse(
    readFileSync(join(__dirname, '..', '..', 'package.json'), 'utf8')
  ) as { scripts: Record<string, string> }

  it('routes every DB segment into test:integration', () => {
    for (const segment of DB_BACKED_PATH_SEGMENTS) {
      expect(packageJson.scripts['test:integration']).toContain(
        `src/${segment}`
      )
    }
  })

  it('excludes every DB segment from the DB-free test:unit job', () => {
    for (const segment of DB_BACKED_PATH_SEGMENTS) {
      expect(packageJson.scripts['test:unit']).toContain(`src/${segment}`)
    }
  })
})

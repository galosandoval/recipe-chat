/**
 * @jest-environment node
 */
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * The CI↔gate parity contract (#648).
 *
 * `bun run gate` runs `typecheck && lint && test`, and the harness runs that
 * same gate after every agent spawn (`agent/implement/run-policy.ts`'s
 * `GATE_COMMAND`). For two weeks CI ran only `bun run test:integration`
 * (`src/server/api`), leaving 53 of 68 jest suites invisible: a null
 * `usePathname()` under jsdom took out 96 tests and CI stayed green because it
 * never executed the component suites. This file is the durable statement of
 * the invariant that let that happen — nothing may be green in CI and red under
 * `bun run gate`. It reads the workflow YAML and lists jest suites, because the
 * relationship spans `test.yml`, `package.json`, and `run-policy.ts` and lives
 * nowhere in TypeScript otherwise.
 */
const repoRoot = join(__dirname, '..', '..')

const workflow = readFileSync(join(__dirname, 'test.yml'), 'utf8')

const packageJson = JSON.parse(
  readFileSync(join(repoRoot, 'package.json'), 'utf8')
) as { scripts: Record<string, string> }

/**
 * The absolute suite paths a `package.json` test script resolves, via
 * `jest --listTests` — the same resolution CI performs, so the sets compared
 * below are exactly what each job would run rather than a guess parsed off the
 * script string.
 */
function listSuites(scriptName: string): Set<string> {
  const script = packageJson.scripts[scriptName]
  if (!script) throw new Error(`no package.json script named ${scriptName}`)
  const output = execSync(`${script} --listTests`, {
    cwd: repoRoot,
    encoding: 'utf8'
  })
  return new Set(output.trim().split('\n').filter(Boolean))
}

describe('CI runs the same suites as the gate (#648)', () => {
  // The load-bearing invariant: `test:unit` ∪ `test:integration` must equal the
  // full `test` run, or a suite is green in CI only because no job executed it.
  it('covers every suite the gate runs across the unit and integration jobs', () => {
    const full = listSuites('test')
    const unit = listSuites('test:unit')
    const integration = listSuites('test:integration')

    const union = new Set([...unit, ...integration])
    expect(union).toEqual(full)
  })

  // Two jobs, not one, is the stated decision — so the halves must be disjoint:
  // a suite in both would double-run, and a suite in neither would vanish.
  it('splits the suites cleanly, with no suite in both halves', () => {
    const unit = listSuites('test:unit')
    const integration = listSuites('test:integration')

    const overlap = [...unit].filter((suite) => integration.has(suite))
    expect(overlap).toEqual([])
  })

  // The union above only guarantees the gate if CI actually invokes those two
  // scripts. Assert the workflow runs each, so narrowing a script narrows what
  // CI covers rather than silently diverging from it.
  it('invokes both halves of the gate from the workflow', () => {
    expect(workflow).toMatch(/bun run test:unit/)
    expect(workflow).toMatch(/bun run test:integration/)
  })

  // The DB-free half of `bun run gate` is `typecheck && lint`; CI has to run
  // both or a type error / lint break is green in CI and red under the gate.
  it('runs typecheck and lint alongside the unit suites', () => {
    expect(workflow).toMatch(/bun run typecheck/)
    expect(workflow).toMatch(/bun run lint/)
  })

  // The split has to fall on the DB boundary, not on the `src/server/api`
  // directory. `jest.setup.ts` serializes every suite whose path contains
  // `/server/api/` OR `/app/api/` behind the Postgres advisory lock, so those
  // suites connect to the database just to acquire it. Any one of them landing
  // in the DB-free `unit` job (no service container) fails there — union parity
  // alone does not catch it, because the suite still runs *somewhere*.
  const requiresDb = (suitePath: string) =>
    suitePath.includes('/server/api/') || suitePath.includes('/app/api/')

  it('keeps every DB-backed suite out of the DB-free unit job', () => {
    const unit = listSuites('test:unit')

    const strandedWithoutDb = [...unit].filter(requiresDb)
    expect(strandedWithoutDb).toEqual([])
  })

  it('runs every DB-backed suite in the DB-backed integration job', () => {
    const full = listSuites('test')
    const integration = listSuites('test:integration')

    const dbBacked = [...full].filter(requiresDb)
    const missing = dbBacked.filter((suite) => !integration.has(suite))
    expect(missing).toEqual([])
  })
})

/**
 * @jest-environment node
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  CLAUDE_CODE_CLI_VERSION,
  GATE_COMMAND,
  IDLE_MINUTES,
  MAX_ITERATIONS,
  MAX_TURNS,
  MODEL,
  PAYLOAD_OWNED_ENV_VARS,
  REQUIRED_ENV_VARS,
  runPolicyCommand,
  WALL_CLOCK_MINUTES
} from './run-policy'

const workflow = readFileSync(
  join(__dirname, '..', '..', '.github', 'workflows', 'agent-implement.yml'),
  'utf8'
)

const packageJson = JSON.parse(
  readFileSync(join(__dirname, '..', '..', 'package.json'), 'utf8')
)

/** The `github-env` output, with the union narrowed once for every test. */
function githubEnv(): string {
  const result = runPolicyCommand(['github-env'])
  if (!('output' in result))
    throw new Error(`github-env failed: ${result.error}`)
  return result.output
}

describe('run-policy contract', () => {
  describe('required env vars', () => {
    // shopfloor 1.0.0 refuses ISSUE_NUMBER / ISSUE_TITLE / BRANCH by name
    // before admission — the payload settles all three. Requiring one here
    // would demand a variable whose presence aborts the run.
    it('names none of the vars the payload owns', () => {
      for (const name of PAYLOAD_OWNED_ENV_VARS) {
        expect(REQUIRED_ENV_VARS).not.toContain(name)
      }
    })

    it('has no duplicate names', () => {
      expect(new Set(REQUIRED_ENV_VARS).size).toBe(REQUIRED_ENV_VARS.length)
    })
  })

  describe('CLI print mode', () => {
    it('cli-version emits the pinned Claude Code CLI version', () => {
      expect(runPolicyCommand(['cli-version'])).toEqual({
        output: CLAUDE_CODE_CLI_VERSION
      })
    })

    // The names are written out rather than interpolated from the module: the
    // whole point of them is that shopfloor reads *these exact keys* off the
    // environment, so a test that derives them from the implementation would
    // follow a rename straight past the harness.
    it('github-env emits every key shopfloor reads off the environment', () => {
      const keys = githubEnv()
        .split('\n')
        .map((line) => line.split('=')[0])

      expect(keys).toEqual([
        'MODEL',
        'MAX_TURNS',
        'MAX_ITERATIONS',
        'IDLE_MINUTES',
        'WALL_CLOCK_MINUTES',
        'CLI_VERSION',
        'GATE_COMMAND',
        'REQUIRED_ENV_VARS'
      ])
    })

    it('github-env emits the contract values', () => {
      expect(githubEnv().split('\n')).toEqual([
        `MODEL=${MODEL}`,
        `MAX_TURNS=${MAX_TURNS}`,
        `MAX_ITERATIONS=${MAX_ITERATIONS}`,
        `IDLE_MINUTES=${IDLE_MINUTES}`,
        `WALL_CLOCK_MINUTES=${WALL_CLOCK_MINUTES}`,
        `CLI_VERSION=${CLAUDE_CODE_CLI_VERSION}`,
        `GATE_COMMAND=${GATE_COMMAND}`,
        `REQUIRED_ENV_VARS=${REQUIRED_ENV_VARS.join(',')}`
      ])
    })

    // $GITHUB_ENV is `KEY=VALUE` per line; a value carrying a newline needs a
    // heredoc delimiter instead, and writing one without it injects arbitrary
    // variables into the job.
    it('github-env emits no multi-line value', () => {
      for (const line of githubEnv().split('\n')) {
        expect(line).toMatch(/^[A-Z_]+=.+$/)
      }
    })

    it('github-env emits none of the vars the payload owns', () => {
      for (const name of PAYLOAD_OWNED_ENV_VARS) {
        expect(githubEnv()).not.toMatch(new RegExp(`^${name}=`, 'm'))
      }
    })

    // The gate names a package.json script instead of restating the three
    // commands it runs, so `bun run gate` locally and the harness's inner loop
    // are the same gate by construction. The failure that buys is a renamed or
    // deleted script: the harness would run it, get "script not found", read a
    // red gate, and burn every iteration re-spawning the agent against a gate
    // that cannot pass.
    it('runs a package.json script that exists', () => {
      const script = GATE_COMMAND.replace(/^bun run /, '')

      expect(GATE_COMMAND).toMatch(/^bun run [\w:-]+$/)
      expect(Object.keys(packageJson.scripts)).toContain(script)
    })

    it('reports an error for an unknown subcommand', () => {
      const result = runPolicyCommand(['nope'])
      expect('error' in result).toBe(true)
    })
  })

  // Deliberately not pure unit tests: they read the workflow YAML, because the
  // invariants they guard span two files and exist nowhere in TypeScript. The
  // regexes are coupled to the workflow's formatting — a parse miss fails
  // loudly (no `run-phase:` block found) rather than passing vacuously.
  describe('the workflow this contract configures', () => {
    // The orchestrator's wall-clock guard has to trip before GitHub's job
    // timeout, or the abrupt job kill preempts the graceful SIGTERM that
    // flushes work, writes failure_reason.txt, and leaves a transcript to
    // upload. Equal values race; this asserts the margin rather than trusting
    // two numbers in two files to be edited together.
    it('caps the run-phase job above the wall-clock budget', () => {
      const lines = workflow.split('\n')
      const start = lines.indexOf('  run-phase:')
      const rest = lines.slice(start + 1)
      const end = rest.findIndex((line) => /^ {2}\S/.test(line))
      const jobBlock = (end === -1 ? rest : rest.slice(0, end)).join('\n')

      const jobCap = Number(
        jobBlock.match(/^ {4}timeout-minutes: (\d+)$/m)?.[1]
      )

      expect(start).toBeGreaterThan(-1)
      expect(jobCap).toBeGreaterThan(WALL_CLOCK_MINUTES)
    })

    // ADR 0002 keeps the harness exact-pinned and upgraded deliberately. The
    // workflow invokes it through `npx`, which pins independently of
    // package.json — two pins, one decision, and a bump that moved only one of
    // them would run a harness nobody chose.
    it('invokes the harness version package.json pins', () => {
      const pinned = packageJson.dependencies['@galosandoval/shopfloor']

      const invocations = [
        ...workflow.matchAll(/@galosandoval\/shopfloor@(\S+)/g)
      ].map((match) => match[1])

      expect(invocations.length).toBeGreaterThan(0)
      for (const invoked of invocations) expect(invoked).toBe(pinned)
    })

    // The failure this guards is the one shopfloor 1.0.0 refuses by name: a
    // workflow still exporting a payload-owned variable aborts every run
    // before admission. It reads as ordinary YAML, so nothing but this notices.
    it('exports none of the vars the payload owns', () => {
      for (const name of PAYLOAD_OWNED_ENV_VARS) {
        expect(workflow).not.toMatch(new RegExp(`^\\s+${name}:`, 'm'))
      }
    })
  })
})

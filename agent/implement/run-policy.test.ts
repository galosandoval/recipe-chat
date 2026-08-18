/**
 * @jest-environment node
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  CLAUDE_CODE_CLI_VERSION,
  MAX_TURNS,
  MODEL,
  OPTIONAL_ENV_VARS,
  PRESERVE_ENV_VARS,
  REQUIRED_ENV_VARS,
  runPolicyCommand,
  WALL_CLOCK_MINUTES
} from './run-policy'

describe('run-policy contract', () => {
  describe('preserve-env allowlist', () => {
    it('covers every required and optional var', () => {
      expect(PRESERVE_ENV_VARS).toEqual([
        ...REQUIRED_ENV_VARS,
        ...OPTIONAL_ENV_VARS
      ])
    })

    it('has no duplicate names', () => {
      expect(new Set(PRESERVE_ENV_VARS).size).toBe(PRESERVE_ENV_VARS.length)
    })
  })

  // Deliberately not a pure unit test: it reads the workflow YAML, because the
  // invariant it guards spans two files and exists nowhere in TypeScript. The
  // regex is coupled to the workflow's formatting — a parse miss fails loudly
  // (no `implement:` block found) rather than passing vacuously.
  describe('wall-clock budget vs. the implement job cap', () => {
    // The orchestrator's wall-clock guard has to trip before GitHub's job
    // timeout, or the abrupt job kill preempts the graceful SIGTERM that
    // flushes work, writes failure_reason.txt, and leaves a transcript to
    // upload. Equal values race; this asserts the margin rather than trusting
    // two numbers in two files to be edited together.
    it('leaves the orchestrator room to kill the run first', () => {
      const workflow = readFileSync(
        join(
          __dirname,
          '..',
          '..',
          '.github',
          'workflows',
          'agent-implement.yml'
        ),
        'utf8'
      )
      // Scoped to the `implement:` job's own block — the file-wide maximum
      // would let a roomy `preflight` cap mask an implement cap sitting at or
      // below the budget. The block runs from `  implement:` to the next
      // two-space-indented key.
      const lines = workflow.split('\n')
      const start = lines.indexOf('  implement:')
      const rest = lines.slice(start + 1)
      const end = rest.findIndex((line) => /^ {2}\S/.test(line))
      const jobBlock = (end === -1 ? rest : rest.slice(0, end)).join('\n')

      const implementJobCap = Number(
        jobBlock.match(/^ {4}timeout-minutes: (\d+)$/m)?.[1]
      )

      expect(start).toBeGreaterThan(-1)
      expect(implementJobCap).toBeGreaterThan(WALL_CLOCK_MINUTES)
    })
  })

  describe('CLI print mode', () => {
    it('env-list emits the preserve-env allowlist the exports declare', () => {
      expect(runPolicyCommand(['env-list'])).toEqual({
        output: PRESERVE_ENV_VARS.join(',')
      })
    })

    it('cli-version emits the pinned Claude Code CLI version', () => {
      expect(runPolicyCommand(['cli-version'])).toEqual({
        output: CLAUDE_CODE_CLI_VERSION
      })
    })

    it('model emits the contract model id', () => {
      expect(runPolicyCommand(['model'])).toEqual({ output: MODEL })
    })

    it('max-turns emits the contract max-turns cap', () => {
      expect(runPolicyCommand(['max-turns'])).toEqual({
        output: String(MAX_TURNS)
      })
    })

    it('reports an error for an unknown subcommand', () => {
      const result = runPolicyCommand(['nope'])
      expect('error' in result).toBe(true)
    })
  })
})

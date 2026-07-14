/**
 * @jest-environment node
 */
import {
  CLAUDE_CODE_CLI_VERSION,
  MAX_TURNS,
  MODEL,
  OPTIONAL_ENV_VARS,
  PRESERVE_ENV_VARS,
  REQUIRED_ENV_VARS,
  findMissingEnvVars,
  resolveIdleMs,
  resolveWallClockMs,
  runPolicyCommand
} from './run-policy'

/** A process env where every required var is present and non-empty. */
function fullEnv(): Record<string, string | undefined> {
  return Object.fromEntries(REQUIRED_ENV_VARS.map((name) => [name, 'set']))
}

describe('run-policy contract', () => {
  describe('findMissingEnvVars', () => {
    it('returns no missing names when every required var is present', () => {
      expect(findMissingEnvVars(fullEnv())).toEqual([])
    })

    it('names every missing required var, in declaration order', () => {
      expect(findMissingEnvVars({})).toEqual([...REQUIRED_ENV_VARS])
    })

    it('treats an empty string as missing', () => {
      const env = fullEnv()
      env.CLAUDE_CODE_OAUTH_TOKEN = ''
      expect(findMissingEnvVars(env)).toEqual(['CLAUDE_CODE_OAUTH_TOKEN'])
    })

    it('ignores optional vars entirely', () => {
      const env = fullEnv()
      for (const name of OPTIONAL_ENV_VARS) delete env[name]
      expect(findMissingEnvVars(env)).toEqual([])
    })
  })

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

  describe('budget resolution', () => {
    it('falls back to the contract idle default when unset', () => {
      expect(resolveIdleMs({})).toBe(15 * 60_000)
    })

    it('falls back to the contract wall-clock default when unset', () => {
      expect(resolveWallClockMs({})).toBe(45 * 60_000)
    })

    it('honors a positive numeric env override', () => {
      expect(resolveIdleMs({ LOCAL_IDLE_MINUTES: '3' })).toBe(3 * 60_000)
      expect(resolveWallClockMs({ LOCAL_WALL_CLOCK_MINUTES: '20' })).toBe(
        20 * 60_000
      )
    })

    it('falls back when the override is empty, non-numeric, or non-positive', () => {
      expect(resolveIdleMs({ LOCAL_IDLE_MINUTES: '' })).toBe(15 * 60_000)
      expect(resolveIdleMs({ LOCAL_IDLE_MINUTES: 'soon' })).toBe(15 * 60_000)
      expect(resolveIdleMs({ LOCAL_IDLE_MINUTES: '0' })).toBe(15 * 60_000)
      expect(resolveWallClockMs({ LOCAL_WALL_CLOCK_MINUTES: '-5' })).toBe(
        45 * 60_000
      )
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

/**
 * The single run-policy contract for the `agent:implement` pipeline (#556).
 *
 * Before this module the run policy — required env vars, runaway-guard budgets,
 * model, max-turns cap, and Claude Code CLI version — was restated across the
 * workflow, the compose file, the local supervisor, and the invocation-assembly
 * module, and "local is a faithful CI rehearsal" was an invariant maintained by
 * hand that had already slipped.
 *
 * Under `@galosandoval/shopfloor` 1.0.0 (#637) there is one consumer: the
 * workflow's `shopfloor-run-phase` step. (The `admit` job runs
 * `shopfloor-admit` ahead of it, but admission happens before a run policy
 * exists and reads nothing from here.) Every value below reaches the run as an
 * **environment variable**, written by {@link runPolicyCommand}'s `github-env`
 * mode into `$GITHUB_ENV` — so the workflow names no budget of its own and the
 * two can never disagree. No IO here — pure values and derivations.
 */

/** Claude model the headless agent runs. */
export const MODEL = 'claude-opus-4-8'

/**
 * Fast-loop backstop cap on agent turns, layered on top of the idle guard and
 * the wall-clock guard.
 */
export const MAX_TURNS = 150

/**
 * Pinned Claude Code CLI version, consumed by the workflow's install step and
 * compared against the running `claude --version` before the spawn. Skills
 * reach the agent through this CLI's own `--plugin-dir` discovery (#601), so
 * the pin must stay at or past a version that behaviour was validated against.
 */
export const CLAUDE_CODE_CLI_VERSION = '2.1.228'

/**
 * Wall-clock runaway budget, in minutes, enforced by the orchestrator (SIGTERM,
 * 30s, SIGKILL) across the whole inner loop — every iteration shares it. The
 * workflow's job `timeout-minutes` sits above this on purpose; see
 * run-policy.test.ts.
 */
export const WALL_CLOCK_MINUTES = 45

/** Idle runaway budget, in minutes. Kills a hung run in minutes, not at a cap. */
export const IDLE_MINUTES = 15

/**
 * How many times one run may respawn the agent (shopfloor 1.0.0's inner loop):
 * the harness runs {@link GATE_COMMAND} itself after each spawn and, on a red
 * gate or a trajectory that fails to close, respawns with the failure appended
 * to the prompt. All iterations share the one wall-clock budget above, so this
 * bounds attempts rather than time.
 */
export const MAX_ITERATIONS = 3

/**
 * The quality gate the harness runs after every spawn — this repo's own
 * vocabulary, which is why the package ships none. `test:e2e` is deliberately
 * absent: the verify phase is best-effort by contract and must never fail a
 * run, and a flaky browser run in the gate would burn iterations instead.
 */
export const GATE_COMMAND = 'bun run typecheck && bun run lint && bun run test'

/**
 * The three variables shopfloor 1.0.0 **refuses by name** on the step that runs
 * `shopfloor-run-phase`: the webhook payload names the issue and its title, and
 * the branch is `agent/issue-<n>`. Exported so both the contract's own lists
 * and the workflow YAML can be held to it — a run that still exports one of
 * these aborts before admission, and nothing but a test notices the line.
 */
export const PAYLOAD_OWNED_ENV_VARS = [
  'ISSUE_NUMBER',
  'ISSUE_TITLE',
  'BRANCH'
] as const

/**
 * Env vars the orchestrator must see, non-empty, before it spends any tokens.
 * The run aborts at startup naming every missing one instead of surfacing
 * mid-run. Deliberately excludes {@link PAYLOAD_OWNED_ENV_VARS}.
 */
export const REQUIRED_ENV_VARS = [
  // Subscription / flat-rate token — never ANTHROPIC_API_KEY (metered).
  'CLAUDE_CODE_OAUTH_TOKEN',
  // The integration suite + any TDD against the DB connect here.
  'DATABASE_PRISMA_URL',
  'DATABASE_URL_NON_POOLING',
  // App/suite paths the agent exercises during TDD and the verify phase.
  'NEXTAUTH_SECRET',
  'OPENAI_API_KEY',
  // The agent reads the issue and drives the verify flow through `gh`; the
  // harness pushes the branch, opens the PR, and moves labels with it.
  'GH_TOKEN'
] as const

/**
 * The contract as `$GITHUB_ENV` lines — every budget the harness reads off the
 * environment, in one place, so the workflow states none of them itself.
 *
 * One `KEY=VALUE` per line, which is why no value here may carry a newline
 * (`github-env emits no multi-line value` holds it to that): a multi-line value
 * needs a heredoc delimiter, and writing one without it injects arbitrary
 * variables into the job.
 */
function githubEnvLines(): string {
  return [
    `MODEL=${MODEL}`,
    `MAX_TURNS=${MAX_TURNS}`,
    `MAX_ITERATIONS=${MAX_ITERATIONS}`,
    `IDLE_MINUTES=${IDLE_MINUTES}`,
    `WALL_CLOCK_MINUTES=${WALL_CLOCK_MINUTES}`,
    `CLI_VERSION=${CLAUDE_CODE_CLI_VERSION}`,
    `GATE_COMMAND=${GATE_COMMAND}`,
    `REQUIRED_ENV_VARS=${REQUIRED_ENV_VARS.join(',')}`
  ].join('\n')
}

/**
 * The CLI print mode: a shell consumer runs `bun run-policy.ts <subcommand>` to
 * read a contract value instead of restating it. Returns the value to print, or
 * an error string for an unknown subcommand.
 */
export function runPolicyCommand(
  argv: string[]
): { output: string } | { error: string } {
  switch (argv[0]) {
    case 'cli-version':
      return { output: CLAUDE_CODE_CLI_VERSION }
    case 'github-env':
      return { output: githubEnvLines() }
    default:
      return {
        error: `Unknown run-policy subcommand: ${argv[0] ?? '(none)'}\nUsage: run-policy.ts <cli-version|github-env>`
      }
  }
}

// True only when this file is the process entry (a shell consumer running
// `bun run-policy.ts <subcommand>`), never when imported as a module — kept as
// an argv check rather than `import.meta.main` so Jest's CJS wrapping parses it.
const invokedAsCli = process.argv[1]?.endsWith('run-policy.ts') ?? false

if (invokedAsCli) {
  const result = runPolicyCommand(process.argv.slice(2))
  if ('error' in result) {
    console.error(result.error)
    process.exit(1)
  }
  process.stdout.write(`${result.output}\n`)
}

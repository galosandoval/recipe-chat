import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { execSync, spawn } from 'node:child_process'
import { captureTranscript } from './transcript'
import { prepareClaudeInvocation } from './claude-invocation'
import { findMissingEnvVars, resolveIdleMs } from './run-policy'

// Orchestrator for the `agent:implement` pipeline (#510). Spawns the Claude
// Code CLI directly (#540 — no more `@ai-hero/sandcastle`): on CI the
// ephemeral runner is the isolation boundary, on a local run it's the Docker
// container. The workflow owns git/PR; this script owns the agent run and the
// runaway guards.

// Validate the whole contract-required env up front, before the Claude CLI
// spawns, so a missing var fails immediately naming every offender instead of
// spending tokens on a doomed run (#556).
const missingEnv = findMissingEnvVars(process.env)
if (missingEnv.length > 0) {
  console.error(`Missing required env var(s): ${missingEnv.join(', ')}`)
  process.exit(1)
}

const ISSUE_NUMBER = process.env.ISSUE_NUMBER as string
const ISSUE_TITLE = process.env.ISSUE_TITLE as string
const BRANCH = process.env.BRANCH as string
/** Subscription / flat-rate token — never `ANTHROPIC_API_KEY` (metered). */
const CLAUDE_CODE_OAUTH_TOKEN = process.env.CLAUDE_CODE_OAUTH_TOKEN as string

/**
 * Absolute path to the coding-standard rules (the skills repo's rules/, cloned
 * by the workflow). Optional: empty on a local run, in which case the prompt
 * skips the standards step. Lives outside the repo so it never enters a commit.
 */
const STANDARDS_DIR = process.env.STANDARDS_DIR ?? ''

/**
 * Directory for agent outputs the PR needs but a commit must not contain (the
 * PR description, failure reason). Lives outside the repo so they never land in
 * a commit; the workflow reads them back.
 */
const OUTPUT_DIR = process.env.OUTPUT_DIR ?? os.tmpdir()
const PR_DESCRIPTION_FILE = path.join(OUTPUT_DIR, 'pr_description.txt')

/**
 * Verify-phase report (#523), passed to the prompt like PR_DESCRIPTION_FILE.
 * Lives in OUTPUT_DIR (outside the repo — never committed); the workflow's
 * post-verify step reads it back.
 */
const VERIFY_REPORT_FILE = path.join(OUTPUT_DIR, 'verify_report.md')

/**
 * Verify-phase screenshots dir (#523), a repo-relative path the agent commits
 * PNGs into, so they get raw URLs for inline rendering in the issue comment.
 */
const SCREENSHOTS_DIR = `.agent/verify/issue-${ISSUE_NUMBER}`

/**
 * Where the agent's full Claude Code session transcript is copied for the
 * workflow to upload as an audit artifact (#532). Lives in OUTPUT_DIR (outside
 * the repo tree) so it never lands in a commit, like pr_description.txt.
 */
const TRANSCRIPT_FILE = path.join(OUTPUT_DIR, 'transcript.jsonl')

/** Claude Code's session store: `$HOME/.claude/projects/<encoded-cwd>/<id>.jsonl`. */
const PROJECTS_DIR = path.join(os.homedir(), '.claude', 'projects')

// Resolved against process.cwd() (the repo root, where the workflow invokes us).
const promptTemplate = fs.readFileSync(
  path.join('agent', 'implement', 'prompt.md'),
  'utf8'
)

const { args, prompt } = prepareClaudeInvocation({
  promptTemplate,
  issueNumber: ISSUE_NUMBER,
  issueTitle: ISSUE_TITLE,
  branch: BRANCH,
  prDescriptionFile: PR_DESCRIPTION_FILE,
  standardsDir: STANDARDS_DIR,
  verifyReportFile: VERIFY_REPORT_FILE,
  screenshotsDir: SCREENSHOTS_DIR,
  // Always stream (#556): the orchestrator's idle guard below watches the
  // CLI's output for a heartbeat, and `--print` text stays silent until the
  // session ends. Streaming gives both adapters — CI and the local rehearsal —
  // the same incremental signal; the local supervisor pretty-prints it.
  streamOutput: true
})

// Never let the child fall through to a metered API key, even if the
// invoking shell happens to have one set — auth must be OAuth-only.
const childEnv = { ...process.env, CLAUDE_CODE_OAUTH_TOKEN }
delete (childEnv as Record<string, unknown>).ANTHROPIC_API_KEY

/** Bounded tail of the CLI's combined stdout/stderr, kept only for the
 *  failure-reason file — the full output already streams live to this
 *  process's own stdout/stderr for the CI job log. */
const TAIL_BYTES = 4000
let outputTail = ''
function captureTail(chunk: Buffer) {
  outputTail = (outputTail + chunk.toString('utf8')).slice(-TAIL_BYTES)
}

// Idle runaway guard (#556): kill a stuck run once its output goes quiet for
// the contract's idle budget (env-overridable), so a hung agent dies in minutes
// in either adapter instead of burning the whole wall clock. Owned here because
// the orchestrator owns the spawned CLI's stdout/stderr; the streaming above
// keeps a healthy run's heartbeat flowing so the guard never trips on it.
const IDLE_MS = resolveIdleMs(process.env)
const IDLE_CHECK_INTERVAL_MS = 15_000
let idleKilled = false

// Runs in-place on the checked-out repo, so it commits directly onto BRANCH —
// the commit-count check below relies on that.
let exitCode: number
try {
  exitCode = await new Promise<number>((resolve, reject) => {
    const child = spawn('claude', [...args, prompt], { env: childEnv })
    let lastActivity = Date.now()
    const markActive = () => {
      lastActivity = Date.now()
    }
    child.stdout.on('data', (chunk: Buffer) => {
      process.stdout.write(chunk)
      captureTail(chunk)
      markActive()
    })
    child.stderr.on('data', (chunk: Buffer) => {
      process.stderr.write(chunk)
      captureTail(chunk)
      markActive()
    })
    const idleTimer = setInterval(() => {
      if (Date.now() - lastActivity > IDLE_MS) {
        idleKilled = true
        console.error(
          `\nFAILED: idle guard tripped after ${Math.round(IDLE_MS / 60_000)} minute(s) — killing the agent.`
        )
        child.kill('SIGKILL')
      }
    }, IDLE_CHECK_INTERVAL_MS)
    child.on('error', (error) => {
      clearInterval(idleTimer)
      reject(error)
    })
    child.on('close', (code) => {
      clearInterval(idleTimer)
      resolve(code ?? 1)
    })
  })
} catch (error) {
  // Capture the transcript even when the CLI fails to start, so blocked runs
  // stay auditable. Best-effort: it must never mask the original failure.
  captureTranscript({ projectsDir: PROJECTS_DIR, destPath: TRANSCRIPT_FILE })
  fail(`Failed to start the Claude CLI: ${String(error)}`)
}

// Copy the agent's session transcript out for the workflow to upload (#532).
// Best-effort; there's exactly one session per run, so the newest-JSONL scan
// inside captureTranscript resolves it unambiguously.
captureTranscript({ projectsDir: PROJECTS_DIR, destPath: TRANSCRIPT_FILE })

if (idleKilled) {
  fail(
    `Agent idle for over ${Math.round(IDLE_MS / 60_000)} minute(s) — killed by the idle guard.\n\n${outputTail}`
  )
}

if (exitCode !== 0) {
  fail(`Claude CLI exited with status ${exitCode}.\n\n${outputTail}`)
}

// The agent commits its own TDD work; a zero-commit run is a failure, not a PR.
const commitsAhead = Number(
  execSync('git rev-list --count main..HEAD', { encoding: 'utf8' }).trim()
)
if (!Number.isFinite(commitsAhead) || commitsAhead === 0) {
  fail('Agent finished but made no commits on the branch.')
}

// Without a description the PR body would be just `Closes #N`. Fall back rather
// than discard otherwise-green commits.
if (!fileHasContent(PR_DESCRIPTION_FILE)) {
  console.warn(
    `No PR description at ${PR_DESCRIPTION_FILE}; writing a fallback.`
  )
  fs.writeFileSync(
    PR_DESCRIPTION_FILE,
    `Implements #${ISSUE_NUMBER}: ${ISSUE_TITLE}\n`
  )
}

console.log(`\n${commitsAhead} commit(s) on ${BRANCH} this run.`)

function fileHasContent(file: string): boolean {
  try {
    return fs.readFileSync(file, 'utf8').trim().length > 0
  } catch {
    return false
  }
}

function fail(message: string): never {
  console.error(`\nFAILED: ${message}`)
  fs.writeFileSync(path.join(OUTPUT_DIR, 'failure_reason.txt'), message)
  process.exit(1)
}

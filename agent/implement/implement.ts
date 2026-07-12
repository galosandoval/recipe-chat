import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { execSync, spawn } from 'node:child_process'
import { captureTranscript } from './transcript'
import { prepareClaudeInvocation } from './claude-invocation'

// Orchestrator for the `agent:implement` pipeline (#510). Spawns the Claude
// Code CLI directly (#540 — no more `@ai-hero/sandcastle`): on CI the
// ephemeral runner is the isolation boundary, on a local run it's the Docker
// container. The workflow owns git/PR; this script owns the agent run and the
// runaway guards.

const ISSUE_NUMBER = required('ISSUE_NUMBER')
const ISSUE_TITLE = required('ISSUE_TITLE')
const BRANCH = required('BRANCH')
/** Subscription / flat-rate token — never `ANTHROPIC_API_KEY` (metered). */
const CLAUDE_CODE_OAUTH_TOKEN = required('CLAUDE_CODE_OAUTH_TOKEN')

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
  screenshotsDir: SCREENSHOTS_DIR
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

// Runs in-place on the checked-out repo, so it commits directly onto BRANCH —
// the commit-count check below relies on that.
let exitCode: number
try {
  exitCode = await new Promise<number>((resolve, reject) => {
    const child = spawn('claude', [...args, prompt], { env: childEnv })
    child.stdout.on('data', (chunk: Buffer) => {
      process.stdout.write(chunk)
      captureTail(chunk)
    })
    child.stderr.on('data', (chunk: Buffer) => {
      process.stderr.write(chunk)
      captureTail(chunk)
    })
    child.on('error', reject)
    child.on('close', (code) => resolve(code ?? 1))
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

function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    console.error(`Missing required env var: ${name}`)
    process.exit(1)
  }
  return value
}

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

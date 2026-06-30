import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { execSync } from 'node:child_process'
import * as sandcastle from '@ai-hero/sandcastle'
import { noSandbox } from '@ai-hero/sandcastle/sandboxes/no-sandbox'
import { captureTranscript, lastSessionFilePath } from './transcript'

// Orchestrator for the `agent:implement` pipeline (#510). Runs Claude directly
// on the ephemeral CI runner via Sandcastle's `noSandbox()` — the runner is the
// isolation boundary (no Docker, no GHCR image). The workflow owns git/PR; this
// script owns the agent run and the runaway guards.

const ISSUE_NUMBER = required('ISSUE_NUMBER')
const ISSUE_TITLE = required('ISSUE_TITLE')
const BRANCH = required('BRANCH')

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
 * Where the agent's full Claude Code session transcript is copied for the
 * workflow to upload as an audit artifact (#532). Lives in OUTPUT_DIR (outside
 * the repo tree) so it never lands in a commit, like pr_description.txt.
 */
const TRANSCRIPT_FILE = path.join(OUTPUT_DIR, 'transcript.jsonl')

/** Claude Code's session store: `$HOME/.claude/projects/<encoded-cwd>/<id>.jsonl`. */
const PROJECTS_DIR = path.join(os.homedir(), '.claude', 'projects')

let result: sandcastle.RunResult
try {
  result = await sandcastle.run({
    name: `implement-#${ISSUE_NUMBER}`,
    agent: sandcastle.claudeCode('claude-opus-4-8', {
      env: {
        // Subscription / flat-rate token — never ANTHROPIC_API_KEY (metered).
        CLAUDE_CODE_OAUTH_TOKEN: required('CLAUDE_CODE_OAUTH_TOKEN')
      }
    }),
    // noSandbox runs the agent in-place on the checked-out repo, so it commits
    // directly onto BRANCH (default branchStrategy "head"). The commit-count
    // check below relies on that — revisit it if this ever moves to docker().
    sandbox: noSandbox(),
    logging: { type: 'stdout' },
    // Resolved against process.cwd() (the repo root, where the workflow invokes us).
    promptFile: '.sandcastle/implement/prompt.md',
    promptArgs: {
      ISSUE_NUMBER,
      ISSUE_TITLE,
      BRANCH,
      PR_DESCRIPTION_FILE,
      STANDARDS_DIR
    },
    // Runaway guard. Sandcastle's claudeCode does not expose Claude's `--max-turns`
    // flag, so the hard caps are wall-clock: this idle timeout (no output for N
    // seconds → fail) plus the workflow's `timeout-minutes: 45`.
    idleTimeoutSeconds: 900
  })
} catch (error) {
  // Capture the transcript even when the run fails, so blocked runs stay
  // auditable. Best-effort: it must never mask the original failure.
  captureTranscript({ projectsDir: PROJECTS_DIR, destPath: TRANSCRIPT_FILE })
  throw error
}

// Copy the agent's session transcript out for the workflow to upload (#532).
captureTranscript({
  sessionFilePath: lastSessionFilePath(result),
  projectsDir: PROJECTS_DIR,
  destPath: TRANSCRIPT_FILE
})

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
console.log(`  commits captured by sandcastle: ${result.commits.length}`)

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

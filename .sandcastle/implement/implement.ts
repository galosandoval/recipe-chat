import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { execSync } from 'node:child_process'
import * as sandcastle from '@ai-hero/sandcastle'
import { noSandbox } from '@ai-hero/sandcastle/sandboxes/no-sandbox'

// Orchestrator for the `agent:implement` pipeline (#510). Runs Claude directly
// on the ephemeral CI runner via Sandcastle's `noSandbox()` — the runner is the
// isolation boundary (no Docker, no GHCR image). The workflow owns git/PR; this
// script owns the agent run and the runaway guards.

const ISSUE_NUMBER = required('ISSUE_NUMBER')
const ISSUE_TITLE = required('ISSUE_TITLE')
const BRANCH = required('BRANCH')

// Written outside the repo so the agent's description never lands in a commit.
// The workflow reads it back and prepends `Closes #N` for the PR body.
const OUTPUT_DIR = process.env.OUTPUT_DIR ?? os.tmpdir()
const PR_DESCRIPTION_FILE = path.join(OUTPUT_DIR, 'pr_description.txt')

const result = await sandcastle.run({
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
    PR_DESCRIPTION_FILE
  },
  // Runaway guard. Sandcastle's claudeCode does not expose Claude's `--max-turns`
  // flag, so the hard caps are wall-clock: this idle timeout (no output for N
  // seconds → fail) plus the workflow's `timeout-minutes: 45`.
  idleTimeoutSeconds: 900
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

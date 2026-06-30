import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { execFileSync } from 'node:child_process'
import {
  buildVerifyComment,
  verifyScreenshotDir,
  type VerifyCommentInput
} from './verify-comment'

// IO entry point for the verify phase's "post proof to the issue" step (#523).
// Runs after "Push branch" (so the raw URLs resolve) and is `always()`-guarded
// around the agent: it reads the agent's verify report from OUTPUT_DIR and the
// screenshots the agent committed under `.agent/verify/issue-<N>/`, then posts a
// single issue comment with the report and the PNGs rendered inline. The pure
// markdown/URL assembly lives in `verify-comment.ts` (unit-tested); this file is
// the GitHub + filesystem edge. Best-effort: a missing report falls back to a
// "couldn't verify" note so the issue still records that verify ran.

const ISSUE_NUMBER = required('ISSUE_NUMBER')
const REPO = required('GITHUB_REPOSITORY')
const BRANCH = required('BRANCH')
const RUN_URL = required('RUN_URL')

const OUTPUT_DIR = process.env.OUTPUT_DIR ?? os.tmpdir()
const VERIFY_REPORT_FILE =
  process.env.VERIFY_REPORT_FILE ?? path.join(OUTPUT_DIR, 'verify_report.txt')

const issueNumber = Number(ISSUE_NUMBER)

const report = readReport()
const screenshots = listCommittedScreenshots(issueNumber)

const input: VerifyCommentInput = {
  report,
  repo: REPO,
  branch: BRANCH,
  issueNumber,
  screenshots,
  runUrl: RUN_URL
}

const body = buildVerifyComment(input)
gh(['issue', 'comment', ISSUE_NUMBER, '--repo', REPO, '--body', body])
console.log(
  `Posted verify comment to #${ISSUE_NUMBER} (${screenshots.length} screenshot(s)).`
)

/** The agent's report, or a fallback note when verify produced none. */
function readReport(): string {
  try {
    const text = fs.readFileSync(VERIFY_REPORT_FILE, 'utf8').trim()
    if (text.length > 0) return text
  } catch {
    // fall through to the fallback note
  }
  return (
    "**Verification couldn't complete.** The agent did not write a verify " +
    'report this run — check the workflow logs and verify the change manually.'
  )
}

/**
 * Repo-relative paths of the PNGs the agent committed for this issue, sorted for
 * a stable comment order. Empty when the directory is absent (non-UI issue or a
 * verify run that captured nothing).
 */
function listCommittedScreenshots(issue: number): string[] {
  const dir = verifyScreenshotDir(issue)
  let entries: string[]
  try {
    entries = fs.readdirSync(dir)
  } catch {
    return []
  }
  return entries
    .filter((name) => /\.(png|jpe?g|gif|webp)$/i.test(name))
    .sort()
    .map((name) => `${dir}/${name}`)
}

function gh(args: string[]) {
  return execFileSync('gh', args, { encoding: 'utf8' })
}

function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    console.error(`Missing required env var: ${name}`)
    process.exit(1)
  }
  return value
}

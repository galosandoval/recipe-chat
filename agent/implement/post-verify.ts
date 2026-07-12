import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { execFileSync } from 'node:child_process'
import { buildVerifyComment } from './verify-comment'

/**
 * IO entry point for the verify phase's "post proof to the PR" step (#523).
 * Runs *after* the draft PR is opened (so there is a PR to comment on, and the
 * push commit's raw URLs resolve): reads the agent's verify report,
 * enumerates the committed screenshots under `.agent/verify/issue-<N>/`,
 * builds the comment via the pure `buildVerifyComment` helper, and posts it
 * with `gh pr comment`. The issue itself is left alone — it already links the
 * PR via `Closes #N`.
 *
 * Best-effort by contract: verify never blocks the PR, so any failure here is
 * logged and swallowed (exit 0) rather than failing the run. The workflow
 * strips `.agent/verify/issue-<N>/` off the branch tip in a follow-up commit
 * regardless of whether this comment posts — the raw URLs are pinned to
 * `SHA` (the commit that still has the files), not the branch name, so they
 * keep resolving after the strip.
 */

const ISSUE_NUMBER = required('ISSUE_NUMBER')
const REPO = required('GITHUB_REPOSITORY')
const PR_NUMBER = required('PR_NUMBER')
const SHA = required('SHA')
const RUN_URL = process.env.RUN_URL ?? ''

const OUTPUT_DIR = process.env.OUTPUT_DIR ?? os.tmpdir()
const VERIFY_REPORT_FILE =
  process.env.VERIFY_REPORT_FILE ?? path.join(OUTPUT_DIR, 'verify_report.md')

/** Repo-relative dir holding the committed PNGs (also where raw URLs point). */
const SCREENSHOTS_DIR =
  process.env.SCREENSHOTS_DIR ?? `.agent/verify/issue-${ISSUE_NUMBER}`

try {
  const report = readReport(VERIFY_REPORT_FILE)
  const screenshots = listScreenshots(SCREENSHOTS_DIR)

  const body = buildVerifyComment({
    report,
    repo: REPO,
    ref: SHA,
    screenshots,
    runUrl: RUN_URL
  })

  const bodyFile = path.join(OUTPUT_DIR, 'verify_comment.md')
  fs.writeFileSync(bodyFile, body)

  gh(['pr', 'comment', PR_NUMBER, '--repo', REPO, '--body-file', bodyFile])
  console.log(
    `Posted verify comment to PR #${PR_NUMBER} (${screenshots.length} screenshot(s)).`
  )
} catch (error) {
  // Never fail the run over the comment — implement commits already landed.
  console.warn(`Could not post verify comment: ${String(error)}`)
}

/** Reads the agent's report, or a fallback note when it is missing/empty. */
function readReport(file: string): string {
  try {
    const text = fs.readFileSync(file, 'utf8').trim()
    if (text) return text
  } catch {
    // fall through to the fallback below
  }
  return `Verification did not produce a report for #${ISSUE_NUMBER} — verify manually.`
}

/**
 * Repo-relative paths of the committed `*.png` screenshots, sorted for a stable
 * order. Empty when the dir is absent (non-UI / skipped runs).
 */
function listScreenshots(dir: string): string[] {
  try {
    return fs
      .readdirSync(dir)
      .filter((name) => name.toLowerCase().endsWith('.png'))
      .sort()
      .map((name) => `${dir}/${name}`)
  } catch {
    return []
  }
}

function gh(args: string[]) {
  return execFileSync('gh', args, { encoding: 'utf8' })
}

function required(name: string) {
  const value = process.env[name]
  if (!value) {
    console.error(`Missing required env var: ${name}`)
    process.exit(1)
  }
  return value
}

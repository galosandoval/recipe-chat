import { execFileSync } from 'node:child_process'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { MAX_TURNS } from './run-policy'
import {
  checkTrajectory,
  formatScorecard,
  type TranscriptEvent
} from './trajectory-checker'

/**
 * Thin runner for the deterministic trajectory checker (#566). Reads the
 * captured Claude Code session transcript, feeds the parsed events into the pure
 * {@link checkTrajectory} module, and surfaces the scorecard: locally it prints
 * alongside the other end-of-run reports (entrypoint.sh cats it), and in CI —
 * when a PR number is present — it posts the scorecard as a PR comment, the same
 * pattern as the verify-comment flow (post-verify.ts).
 *
 * Never-throw by contract (user stories 8/11): findings are advisory and never
 * change the exit code, and a malformed/missing transcript degrades to "no
 * scorecard", never a red build. All IO lives here so the checker stays pure.
 */

const OUTPUT_DIR = process.env.OUTPUT_DIR ?? os.tmpdir()
const TRANSCRIPT_FILE =
  process.env.TRANSCRIPT_FILE ?? path.join(OUTPUT_DIR, 'transcript.jsonl')
const SCORECARD_FILE = path.join(OUTPUT_DIR, 'trajectory_scorecard.md')

/** CI-only: set by the workflow once the draft PR exists. */
const PR_NUMBER = process.env.PR_NUMBER
const REPO = process.env.GITHUB_REPOSITORY

try {
  const scorecard = buildScorecard(TRANSCRIPT_FILE)
  if (scorecard === null) {
    console.warn(
      `No trajectory scorecard: transcript missing or unreadable at ${TRANSCRIPT_FILE}.`
    )
  } else {
    fs.writeFileSync(SCORECARD_FILE, `${scorecard}\n`)
    console.log(`\n${scorecard}\n`)
    if (PR_NUMBER && REPO) postComment(PR_NUMBER, REPO, SCORECARD_FILE)
  }
} catch (error) {
  // Observability must never break the run — swallow and warn only.
  console.warn(`Trajectory check skipped: ${String(error)}`)
}

/** Parse the JSONL transcript (skipping malformed lines) and render markdown, or null when there is nothing to read. */
function buildScorecard(file: string): string | null {
  if (!fs.existsSync(file)) return null
  const events = readTranscript(file)
  const findings = checkTrajectory(events, { maxTurns: MAX_TURNS })
  return formatScorecard(findings)
}

/** One parsed record per line; a line that fails to parse is dropped, not fatal. */
function readTranscript(file: string): TranscriptEvent[] {
  const events: TranscriptEvent[] = []
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    if (!line.trim()) continue
    try {
      events.push(JSON.parse(line))
    } catch {
      // A truncated final line or a stray non-JSON line degrades the transcript
      // to "partial", never to a throw — checkTrajectory handles a thin result.
    }
  }
  return events
}

function postComment(prNumber: string, repo: string, bodyFile: string) {
  try {
    execFileSync(
      'gh',
      ['pr', 'comment', prNumber, '--repo', repo, '--body-file', bodyFile],
      { stdio: 'inherit' }
    )
    console.log(`Posted trajectory scorecard to PR #${prNumber}.`)
  } catch (error) {
    console.warn(`Could not post trajectory scorecard: ${String(error)}`)
  }
}

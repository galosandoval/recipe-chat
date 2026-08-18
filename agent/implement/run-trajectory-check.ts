import { execFileSync } from 'node:child_process'
import * as os from 'node:os'
import * as path from 'node:path'
import { runTrajectoryCheck } from '@galosandoval/shopfloor'
import { MAX_TURNS } from './run-policy'

/**
 * Thin invocation of `@galosandoval/shopfloor`'s `runTrajectoryCheck`
 * (#566, relocated in shopfloor#38): the package reads the captured session
 * transcript, grades it against its four process invariants, and renders the
 * scorecard. The checker itself used to live here — it graded a run using facts
 * the harness owns (`MAX_TURNS`, the command policy's rule set, the implement
 * phase's TDD contract), so it moved to where those facts are.
 *
 * This script only surfaces the result: locally it prints alongside the other
 * end-of-run reports (entrypoint.sh cats it), and in CI — when a PR number is
 * present — it posts the scorecard as a PR comment.
 *
 * Never-throw by contract (#566, user stories 8/11): findings are advisory and
 * never change the exit code, and a malformed/missing transcript degrades to
 * "no scorecard", never a red build.
 */

const OUTPUT_DIR = process.env.OUTPUT_DIR ?? os.tmpdir()
const TRANSCRIPT_FILE =
  process.env.TRANSCRIPT_FILE ?? path.join(OUTPUT_DIR, 'transcript.jsonl')
const SCORECARD_FILE = path.join(OUTPUT_DIR, 'trajectory_scorecard.md')

/** CI-only: set by the workflow once the draft PR exists. */
const PR_NUMBER = process.env.PR_NUMBER
const REPO = process.env.GITHUB_REPOSITORY

try {
  const result = runTrajectoryCheck({
    transcriptFile: TRANSCRIPT_FILE,
    maxTurns: MAX_TURNS,
    scorecardFile: SCORECARD_FILE
  })

  if (!result.graded) {
    console.warn(
      `No trajectory scorecard: transcript missing or unreadable at ${TRANSCRIPT_FILE}.`
    )
  } else {
    console.log(`\n${result.scorecard}\n`)
    if (result.error) {
      console.warn(
        `Could not write the scorecard file: ${String(result.error)}`
      )
    } else if (PR_NUMBER && REPO) {
      postComment(PR_NUMBER, REPO, SCORECARD_FILE)
    }
  }
} catch (error) {
  // Observability must never break the run — swallow and warn only.
  console.warn(`Trajectory check skipped: ${String(error)}`)
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

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
 * This script only surfaces the result. Under shopfloor 1.0.0 (#637) the
 * closure gate inside `runPhase` grades the same scorecard and can hold a run
 * open on it, but it does not post it anywhere — so without this step the
 * grading is invisible to the human reading the PR, which is the whole of
 * #566. It runs after `shopfloor-run-phase` and comments on the PR that verb
 * opened.
 *
 * Never-throw by contract (#566, user stories 8/11): findings are advisory and
 * never change the exit code, and a malformed/missing transcript degrades to
 * "no scorecard", never a red build.
 */

const OUTPUT_DIR = process.env.OUTPUT_DIR ?? os.tmpdir()
const TRANSCRIPT_FILE =
  process.env.TRANSCRIPT_FILE ?? path.join(OUTPUT_DIR, 'transcript.jsonl')
const SCORECARD_FILE = path.join(OUTPUT_DIR, 'trajectory_scorecard.md')

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
    } else if (REPO) {
      const prNumber = pullRequestForCurrentBranch(REPO)
      if (prNumber) postComment(prNumber, REPO, SCORECARD_FILE)
      else console.warn('No pull request on this branch to comment on.')
    }
  }
} catch (error) {
  // Observability must never break the run — swallow and warn only.
  console.warn(`Trajectory check skipped: ${String(error)}`)
}

/**
 * The open PR on the branch this run is standing on, or `undefined`.
 *
 * Asked of `gh` rather than taken from an env var: 1.0.0's `shopfloor-run-phase`
 * opens (or reuses) the PR itself and exposes no step output, so the branch is
 * the only handle the workflow can pass on. Swallows its own failure — a
 * missing PR is "nothing to comment on", never a red build.
 */
function pullRequestForCurrentBranch(repo: string): string | undefined {
  try {
    const branch = execFileSync('git', ['branch', '--show-current'], {
      encoding: 'utf8'
    }).trim()
    if (!branch) return undefined

    const found = execFileSync(
      'gh',
      [
        'pr',
        'list',
        '--repo',
        repo,
        '--head',
        branch,
        '--state',
        'open',
        '--limit',
        '1',
        '--json',
        'number',
        '--jq',
        '.[0].number // empty'
      ],
      { encoding: 'utf8' }
    ).trim()

    return found || undefined
  } catch (error) {
    console.warn(
      `Could not resolve the branch's pull request: ${String(error)}`
    )
    return undefined
  }
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

import * as fs from 'node:fs'
import { execFileSync } from 'node:child_process'
import {
  evaluatePreflight,
  parseClosingReferences,
  type LinkingPullRequest
} from './preflight'

// IO entry point for the pre-flight refusal gate (#511). Runs as its own
// workflow job *before* any branch/PR work: gathers the labeled issue's native
// parent/sub-issue links and the open PRs targeting it, then asks the pure
// logic in `preflight.ts` for a verdict. On refusal it swaps the labels, posts
// an explanatory comment, and signals the implement job to skip — so a PRD, a
// sub-issue, or an already-PR'd issue never spawns a branch or a draft PR.

const ISSUE_NUMBER = required('ISSUE_NUMBER')
const REPO = required('GITHUB_REPOSITORY')

const issue = JSON.parse(
  gh([
    'issue',
    'view',
    ISSUE_NUMBER,
    '--repo',
    REPO,
    '--json',
    'parent,subIssues'
  ])
) as {
  parent: { number: number } | null
  subIssues: { totalCount: number }
}

const subIssueCount = issue.subIssues?.totalCount ?? 0
const parentNumber = issue.parent?.number ?? null

// GitHub recognises closing keywords in a PR's body; list every open PR and
// keep the ones that close this issue. `--limit` is generous so a busy repo
// doesn't silently truncate the scan.
const openPullRequests = JSON.parse(
  gh([
    'pr',
    'list',
    '--repo',
    REPO,
    '--state',
    'open',
    '--limit',
    '200',
    '--json',
    'number,title,body,url'
  ])
) as Array<{ number: number; title: string; body: string | null; url: string }>

const issueNumber = Number(ISSUE_NUMBER)
const linkingPullRequests: LinkingPullRequest[] = openPullRequests
  .filter((pr) =>
    parseClosingReferences(`${pr.title ?? ''}\n${pr.body ?? ''}`).includes(
      issueNumber
    )
  )
  .map((pr) => ({ number: pr.number, url: pr.url }))

const verdict = evaluatePreflight({
  subIssueCount,
  parentNumber,
  linkingPullRequests
})

if (verdict.refused) {
  // Refuse before any work: drop the go/spend label, flag blocked, explain why.
  gh([
    'issue',
    'edit',
    ISSUE_NUMBER,
    '--repo',
    REPO,
    '--remove-label',
    'agent:implement',
    '--add-label',
    'agent:blocked'
  ])
  gh([
    'issue',
    'comment',
    ISSUE_NUMBER,
    '--repo',
    REPO,
    '--body',
    `\`agent:implement\` refused before starting.\n\n**Reason:** ${verdict.reason}\n\nFix the above and re-add \`agent:implement\` to retry.`
  ])
  setOutput('refused', 'true')
  console.log(`Pre-flight refused #${ISSUE_NUMBER}: ${verdict.reason}`)
} else {
  setOutput('refused', 'false')
  console.log(`Pre-flight passed for #${ISSUE_NUMBER}.`)
}

function gh(args: string[]): string {
  return execFileSync('gh', args, { encoding: 'utf8' })
}

function setOutput(name: string, value: string): void {
  const file = process.env.GITHUB_OUTPUT
  if (!file) {
    console.warn(`GITHUB_OUTPUT unset; would have written ${name}=${value}`)
    return
  }
  fs.appendFileSync(file, `${name}=${value}\n`)
}

function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    console.error(`Missing required env var: ${name}`)
    process.exit(1)
  }
  return value
}

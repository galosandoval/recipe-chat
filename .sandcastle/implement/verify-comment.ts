// Pure helpers for the `agent:implement` verify phase (#523). The verify phase
// captures Playwright screenshots into `.agent/verify/issue-<N>/`, commits them
// to the PR branch, and the workflow posts them back on the originating issue as
// inline proof. These functions turn (repo, branch, issue, screenshot paths,
// report) into the markdown comment body and the raw URLs that render the PNGs
// inline. No IO here — `post-verify-comment.ts` reads the committed directory
// and calls `gh issue comment`; this module is the unit-testable seam.

/** Repo-relative directory the verify phase commits its screenshots into. */
export function verifyScreenshotDir(issueNumber: number): string {
  return `.agent/verify/issue-${issueNumber}`
}

/**
 * Raw URL for a committed file, so the issue comment renders it inline without
 * an artifact download. Each path segment is percent-encoded (filenames may
 * contain spaces) while the slashes are preserved.
 */
export function rawScreenshotUrl(
  repo: string,
  branch: string,
  repoRelativePath: string
): string {
  const encodedPath = repoRelativePath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')
  return `https://raw.githubusercontent.com/${repo}/${branch}/${encodedPath}`
}

export interface VerifyCommentInput {
  /** Agent's markdown verify report (verdict + what was checked). */
  report: string
  /** "owner/name", e.g. "galosandoval/recipe-chat". */
  repo: string
  /** Branch the screenshots were committed to (raw URLs resolve against it). */
  branch: string
  /** Issue being verified. */
  issueNumber: number
  /** Repo-relative paths of committed screenshots; empty for non-UI issues. */
  screenshots: string[]
  /** URL of the workflow run, for a "jump to logs" link. */
  runUrl: string
}

/** Basename of a path, used as the image alt text. */
function basename(p: string): string {
  const parts = p.split('/')
  return parts[parts.length - 1] ?? p
}

/**
 * Assemble the single issue comment: the agent's report, the screenshots
 * rendered inline (omitted entirely when there are none, e.g. a backend-only
 * issue), and a link to the workflow run for the full logs.
 */
export function buildVerifyComment(input: VerifyCommentInput): string {
  const sections = [input.report.trim()]

  if (input.screenshots.length > 0) {
    const images = input.screenshots
      .map((path) => {
        const url = rawScreenshotUrl(input.repo, input.branch, path)
        return `![${basename(path)}](${url})`
      })
      .join('\n\n')
    sections.push(`### Screenshots\n\n${images}`)
  }

  sections.push(`[workflow run](${input.runUrl})`)

  return sections.join('\n\n')
}

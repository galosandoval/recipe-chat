/**
 * Pure helpers for the agent verify phase (#523): turn a committed-screenshots
 * list + branch + repo into the markdown issue comment the workflow posts. No
 * `gh`, filesystem, or Playwright calls live here — that I/O is in
 * `post-verify.ts`, exactly as `run-preflight.ts` wraps the pure `preflight.ts`.
 */

export interface VerifyCommentInput {
  /** The agent's verify report (markdown), or a fallback note when absent. */
  report: string
  /** `owner/repo`, e.g. `galosandoval/recipe-chat`. */
  repo: string
  /** Branch the screenshots were committed to (raw URLs resolve against it). */
  branch: string
  /**
   * Repo-relative paths of the committed screenshots, e.g.
   * `.agent/verify/issue-5/recipes.png`. Empty for non-UI / skipped runs.
   */
  screenshots: string[]
  /** URL of the workflow run, linked so the issue jumps to the full logs. */
  runUrl: string
}

/**
 * Builds a `raw.githubusercontent.com` URL for a committed file so the image
 * renders inline in the issue comment. Each path/branch segment is
 * percent-encoded while the slashes are preserved.
 */
function rawUrl(repo: string, branch: string, filePath: string): string {
  const encode = (segmented: string) =>
    segmented.split('/').map(encodeURIComponent).join('/')
  return `https://raw.githubusercontent.com/${repo}/${encode(branch)}/${encode(filePath)}`
}

/**
 * Assembles the full issue-comment body: the agent's verify report, an inline
 * image for each committed screenshot (raw URLs against `branch`), and a link
 * to the workflow run. With no screenshots (non-UI / skipped / failed-capture
 * runs) the report and run link stand alone.
 */
export function buildVerifyComment(input: VerifyCommentInput): string {
  const { report, repo, branch, screenshots, runUrl } = input

  const parts = [report.trim() || '_No verify report was produced._']

  if (screenshots.length > 0) {
    const images = screenshots.map((file) => {
      const name = file.split('/').pop() ?? file
      return `![${name}](${rawUrl(repo, branch, file)})`
    })
    parts.push(`### Screenshots\n\n${images.join('\n\n')}`)
  }

  parts.push(`[View the workflow run](${runUrl})`)

  return `${parts.join('\n\n')}\n`
}

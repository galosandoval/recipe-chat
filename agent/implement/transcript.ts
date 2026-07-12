import * as fs from 'node:fs'
import * as path from 'node:path'

/**
 * Locate the most recently modified Claude Code session JSONL under
 * `projectsDir` (the `$HOME/.claude/projects/<encoded-cwd>/<id>.jsonl` tree).
 *
 * Used as the fallback when the run result/error does not carry an explicit
 * session path — on an ephemeral CI runner there is exactly one session, so
 * "newest JSONL" resolves it unambiguously. Best-effort: returns undefined and
 * never throws when the tree is missing or holds no `.jsonl` files.
 */
export function findNewestSessionFile(projectsDir: string): string | undefined {
  let newest: { path: string; mtimeMs: number } | undefined
  const stack = [projectsDir]
  try {
    while (stack.length > 0) {
      const dir = stack.pop()
      if (dir === undefined) continue
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          stack.push(full)
        } else if (entry.isFile() && entry.name.endsWith('.jsonl')) {
          const { mtimeMs } = fs.statSync(full)
          if (!newest || mtimeMs > newest.mtimeMs) {
            newest = { path: full, mtimeMs }
          }
        }
      }
    }
  } catch {
    // Best-effort: a missing/unreadable tree just yields whatever we found.
  }
  return newest?.path
}

/**
 * The session JSONL path from the last iteration that captured one, or
 * undefined when session capture was disabled or no iteration recorded a path.
 */
export function lastSessionFilePath(result: {
  iterations: readonly { readonly sessionFilePath?: string }[]
}): string | undefined {
  for (let i = result.iterations.length - 1; i >= 0; i--) {
    const file = result.iterations[i].sessionFilePath
    if (file) return file
  }
  return undefined
}

/**
 * Copy the agent's session transcript to `destPath`, best-effort.
 *
 * Prefers `sessionFilePath` (from the run result/error); falls back to the
 * newest JSONL under `projectsDir` when that path is absent or missing on disk.
 * Returns true when a transcript was written. Never throws — transcript capture
 * is observability only and must never fail an otherwise-green implement run.
 */
export function captureTranscript(opts: {
  sessionFilePath?: string
  projectsDir: string
  destPath: string
}): boolean {
  const source =
    opts.sessionFilePath && fileExists(opts.sessionFilePath)
      ? opts.sessionFilePath
      : findNewestSessionFile(opts.projectsDir)
  if (!source) return false
  try {
    fs.copyFileSync(source, opts.destPath)
    return true
  } catch {
    return false
  }
}

function fileExists(file: string): boolean {
  try {
    return fs.statSync(file).isFile()
  } catch {
    return false
  }
}

import * as path from 'node:path'

// Shared helper for verify-phase specs (#523). The agent's spec captures the
// final state of each user-facing acceptance criterion into
// `.agent/verify/issue-<N>/`; the workflow commits that directory and posts the
// PNGs inline on the originating issue. `VERIFY_ISSUE` is set by the agent's
// verify run; locally it falls back to a `local` directory so a human can run
// the same spec without an issue number.
const VERIFY_ROOT = '.agent/verify'

/** Directory the current verify run writes its screenshots into. */
export function verifyDir(): string {
  const issue = process.env.VERIFY_ISSUE
  return path.join(VERIFY_ROOT, issue ? `issue-${issue}` : 'local')
}

/** Absolute-within-repo path for a named screenshot in the verify directory. */
export function screenshotPath(name: string): string {
  return path.join(verifyDir(), name)
}

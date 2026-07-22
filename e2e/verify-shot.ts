import type { Page } from '@playwright/test'

/**
 * Writes an agent-verify screenshot, but only on CI — where an agent is
 * gathering evidence for a PR. Local `bun run test:e2e` runs stay silent so
 * they don't litter `.agent/verify/issue-<N>/` on every run.
 */
export async function verifyShot(
  page: Page,
  path: string,
  opts?: { fullPage?: boolean }
) {
  if (!process.env.CI) return
  await page.screenshot({ path, fullPage: opts?.fullPage })
}

import { test, expect } from '@playwright/test'
import { screenshotPath } from './verify'

// Example durable e2e spec (#523) — also the template the agent's verify phase
// follows: navigate as the authenticated seeded user, assert on what the user
// sees, and capture the final state into `.agent/verify/issue-<N>/` as proof.
// It uses the shared auth fixture (storageState), so it never re-scripts login.
test.describe('authenticated chat', () => {
  test('the seeded user lands on the chat screen', async ({ page }) => {
    await page.goto('/chat')

    // The message composer is the always-present anchor of the chat screen.
    const composer = page.getByRole('textbox')
    await expect(composer.first()).toBeVisible()

    await page.screenshot({
      path: screenshotPath('chat.png'),
      fullPage: true
    })
  })
})

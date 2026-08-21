import { test, expect } from '@playwright/test'
import en from '../public/translations/en.json'
import { verifyShot } from './verify-shot'

/**
 * Issue #609 — the signed-out hero's composer mock cycles through real, messy
 * example prompts so the hero shows, within a few seconds, that the assistant
 * understands natural asks. These specs drive the signed-out landing at a phone
 * viewport: the default context asserts the mock advances past its first prompt,
 * and the reduced-motion context asserts it holds one prompt and never advances.
 * Screenshots land in `.agent/verify/issue-609`.
 */
const prompts = Object.values(en.landing.hero.examplePrompts)

// Signed out: drop the authenticated session the chromium project injects.
test.use({
  storageState: { cookies: [], origins: [] },
  viewport: { width: 390, height: 844 }
})

test('the hero composer mock cycles through example prompts', async ({
  page
}) => {
  await page.goto('/')

  // The hero opens on the first messy example prompt.
  await expect(page.getByText(prompts[0]).first()).toBeVisible()
  await verifyShot(page, '.agent/verify/issue-609/first-prompt.png')

  // Within a few seconds it advances to the next one — the cycle is real, not
  // a single static prompt.
  await expect(page.getByText(prompts[1]).first()).toBeVisible({
    timeout: 15_000
  })
  await verifyShot(page, '.agent/verify/issue-609/cycled-prompt.png')
})

test.describe('with reduced motion', () => {
  test('shows one prompt and never advances', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')

    // One prompt shows...
    await expect(page.getByText(prompts[0]).first()).toBeVisible()
    await verifyShot(page, '.agent/verify/issue-609/reduced-motion-static.png')

    // ...and the cycle never kicks in: no later prompt ever enters the DOM.
    await page.waitForTimeout(8_000)
    await expect(page.getByText(prompts[1])).toHaveCount(0)
    await expect(page.getByText(prompts[2])).toHaveCount(0)
  })
})

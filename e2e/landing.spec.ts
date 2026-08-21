import { test, expect, type Page } from '@playwright/test'
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

// Issue #610 — the "ask → answer" proof section below the hero. The two specs
// below assert what a unit test can't see: that the section is actually
// *painted*, not just in the DOM. Reveals start at `opacity: 0` and are
// server-rendered that way, so a section that never settles reads as blank to a
// visitor while every text assertion still passes.
const proof = en.landing.proof

/** Settled opacity of the reveal wrapper the given text sits inside. */
async function revealOpacity(page: Page, text: string) {
  return page
    .getByText(text)
    .first()
    .evaluate((el) => {
      const reveal = el.closest('[data-reveal]')
      if (!reveal) throw new Error('text is not inside a [data-reveal] wrapper')
      return getComputedStyle(reveal).opacity
    })
}

test('the proof section settles the exchange and both Recipe Options', async ({
  page
}) => {
  await page.goto('/')

  await page
    .getByRole('heading', { name: proof.heading })
    .scrollIntoViewIfNeeded()

  await expect(page.getByText(proof.ask)).toBeVisible()
  await expect(page.getByText(proof.options.first.name)).toBeVisible()
  await expect(page.getByText(proof.options.second.name)).toBeVisible()

  // The staggered reveal has finished — nothing is left mid-animation.
  await expect
    .poll(() => revealOpacity(page, proof.options.second.name))
    .toBe('1')
  await verifyShot(page, '.agent/verify/issue-610/proof-section.png')
})

test('the proof section renders static under reduced motion', async ({
  page
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')

  // Fully opaque before anything scrolls it into view: no entrance ran, and
  // nothing is waiting on one to become visible.
  expect(await revealOpacity(page, proof.ask)).toBe('1')
  expect(await revealOpacity(page, proof.options.first.name)).toBe('1')

  await page
    .getByRole('heading', { name: proof.heading })
    .scrollIntoViewIfNeeded()
  await expect(page.getByText(proof.options.second.name)).toBeVisible()
  await verifyShot(page, '.agent/verify/issue-610/proof-reduced-motion.png')
})

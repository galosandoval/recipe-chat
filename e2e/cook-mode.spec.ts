import { test, expect } from '@playwright/test'
import { verifyShot } from './verify-shot'

/**
 * Issue #422 — Cook Mode.
 *
 * Drives the full user flow on the seeded recipe (alice@prisma.io, promoted to
 * the STARTER tier in the seed so the gated feature is reachable):
 *
 *  - the STARTER-gated Cook Mode FAB opens a full-screen, distraction-free view;
 *  - instructions are one snap-scrolling list; previous/next and a plain scroll
 *    both move the active step;
 *  - a step that mentions a cooking time offers a countdown timer;
 *  - the ingredient list is reachable as an overlay;
 *  - exit returns to the normal recipe view.
 *
 * Screenshots land in `.agent/verify/issue-422`.
 */
test('cooks a recipe step-by-step in Cook Mode', async ({ page }) => {
  const shot = (name: string) =>
    verifyShot(page, `.agent/verify/issue-422/${name}.png`)

  // Open the seeded recipe's detail page. It also appears in the "Recent" strip,
  // so disambiguate with `.first()`.
  await page.goto('/recipes')
  await page
    .getByText('CREAMY MUSHROOM TOAST', { exact: false })
    .first()
    .click()
  await page.waitForURL(/\/recipes\/.+/)

  // The Cook Mode FAB is gated behind STARTER — visible for the seeded user.
  const cookFab = page.getByRole('button', { name: 'Cook mode' })
  await expect(cookFab).toBeVisible()
  await cookFab.click({ force: true })

  // Full-screen view opens on the first step with large, readable text.
  const cookDialog = page.getByRole('dialog', { name: 'Cook Mode' })
  await expect(cookDialog).toBeVisible()
  const activeStep = cookDialog.locator('li[aria-current="step"]')
  await expect(activeStep).toContainText('Step 1 of 3')
  await expect(page.getByRole('button', { name: 'Previous' })).toBeDisabled()
  await shot('cook-mode-open')

  // Next advances and snaps step 2 (which mentions "1-2 minutes") to the top.
  await page.getByRole('button', { name: 'Next' }).click()
  await expect(activeStep).toContainText('Step 2 of 3')
  await shot('step-navigation')

  // Scrolling the list alone moves the active step — no button press needed.
  await cookDialog.getByRole('list').evaluate((el) => {
    el.scrollTop = el.scrollHeight
  })
  await expect(activeStep).toContainText('Step 3 of 3')
  await page.getByRole('button', { name: 'Previous' }).click()
  await expect(activeStep).toContainText('Step 2 of 3')

  // Timer integration: the step's cooking time surfaces a countdown control.
  const setTimer = activeStep.getByRole('button', { name: /Set timer:/ })
  await expect(setTimer).toBeVisible()
  await setTimer.click()
  await expect(activeStep.getByText('02:00')).toBeVisible()
  await shot('timer')

  // Ingredients accessible as an overlay.
  await page.getByRole('button', { name: 'Show ingredients' }).click()
  const ingredientsDialog = page.getByRole('dialog', { name: 'Ingredients' })
  await expect(ingredientsDialog).toBeVisible()
  await expect(
    ingredientsDialog.getByText('3 cloves garlic, smashed')
  ).toBeVisible()
  await shot('ingredients')
  await page.getByRole('button', { name: 'Hide ingredients' }).click()

  // Easy exit back to the normal recipe view.
  await page.getByRole('button', { name: 'Exit cook mode' }).click()
  await expect(cookDialog).toBeHidden()
  await expect(cookFab).toBeVisible()
  await shot('exit')
})

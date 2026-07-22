import { test, expect } from '@playwright/test'
import { verifyShot } from './verify-shot'

/**
 * Issue #526 — inline edit mode on the Recipe detail page plus editable Facets.
 *
 * Drives the real user flow as the seeded user (alice@prisma.io, one recipe):
 * open the Recipe, flip into inline edit mode via the pencil button, stage a
 * cuisine and a diet tag, Save once, and confirm the new Facets surface as
 * badges back in the reading view. Screenshots land in `.agent/verify/issue-526`.
 */
test('inline-edits a Recipe and surfaces its Facets as badges', async ({
  page
}) => {
  const shot = (name: string) =>
    verifyShot(page, `.agent/verify/issue-526/${name}.png`)

  // Open the seeded recipe's detail page. It also appears in the "Recent"
  // strip, so disambiguate with `.first()`.
  await page.goto('/recipes')
  await page
    .getByText('CREAMY MUSHROOM TOAST', { exact: false })
    .first()
    .click()
  await page.waitForURL(/\/recipes\/.+/)

  // Reading view: the inline Edit button is visible; with no Facets yet, no
  // Facet badges render (empty Facets are omitted).
  const editButton = page.getByRole('button', { name: 'Edit recipe' })
  await expect(editButton).toBeVisible()
  await shot('reading-view')

  // Flip into inline edit mode. The Edit button is a floating action button with
  // an entrance animation, so force the click past the stability check.
  await editButton.click({ force: true })
  await expect(page.getByLabel('Name')).toBeVisible()

  // Add diet and flavor tags via the Manage-Filters-style add rows; each staged
  // tag becomes an editable row with an X-to-remove control.
  await page.getByPlaceholder('New diet tag').fill('vegetarian')
  await page.getByPlaceholder('New diet tag').press('Enter')
  await expect(
    page.getByRole('button', { name: 'Delete vegetarian' })
  ).toBeVisible()

  await page.getByPlaceholder('New flavor tag').fill('savory')
  await page.getByPlaceholder('New flavor tag').press('Enter')
  await expect(
    page.getByRole('button', { name: 'Delete savory' })
  ).toBeVisible()
  await shot('edit-mode')

  // One Save commits everything and returns to the reading view.
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(editButton).toBeVisible()

  // The staged Facets now render as badges in the reading view.
  const dietBadge = page.getByText('vegetarian', { exact: true })
  await expect(dietBadge).toBeVisible()
  await expect(page.getByText('savory', { exact: true })).toBeVisible()
  await dietBadge.scrollIntoViewIfNeeded()
  await shot('facets-badges')
})

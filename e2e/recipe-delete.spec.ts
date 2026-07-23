import { test, expect } from '@playwright/test'
import { verifyShot } from './verify-shot'

/**
 * Issue #564 — the Recipe delete-cascade moved from the router into the recipes
 * use-case. Drives the real user flow as the seeded user (alice@prisma.io, one
 * recipe): open the Recipe, flip into edit mode, delete it, confirm, and assert
 * it disappears from `/recipes`. This exercises the cascade end to end (the
 * Recipe plus its Ingredients, Instructions, and Message links are removed).
 * Screenshots land in `.agent/verify/issue-564`.
 */
test('deletes a Recipe and removes it from the collection', async ({
  page
}) => {
  const shot = (name: string) =>
    verifyShot(page, `.agent/verify/issue-564/${name}.png`)

  // Open the seeded recipe's detail page. It also appears in the "Recent"
  // strip, so disambiguate with `.first()`.
  await page.goto('/recipes')
  await page
    .getByText('CREAMY MUSHROOM TOAST', { exact: false })
    .first()
    .click()
  await page.waitForURL(/\/recipes\/.+/)

  // Flip into inline edit mode, where the destructive Delete button lives
  // (issue #563). The Edit button is a floating action button with an entrance
  // animation, so force the click past the stability check.
  const editButton = page.getByRole('button', { name: 'Edit recipe' })
  await editButton.click({ force: true })
  const deleteButton = page.getByRole('button', { name: 'Delete' })
  await expect(deleteButton).toBeVisible()
  await shot('edit-mode-delete-button')

  // Open the confirmation dialog and confirm the deletion.
  await deleteButton.click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByText('Delete recipe')).toBeVisible()
  await shot('confirm-dialog')
  await dialog.getByRole('button', { name: 'Delete' }).click()

  // On success the app redirects back to the collection; the deleted recipe is
  // gone from the grid and the "Recent" strip.
  await page.waitForURL(/\/recipes\/?$/)
  await expect(
    page.getByText('CREAMY MUSHROOM TOAST', { exact: false })
  ).toHaveCount(0)
  await shot('collection-after-delete')
})

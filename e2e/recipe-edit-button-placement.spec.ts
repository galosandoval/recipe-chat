import { test, expect } from '@playwright/test'

/**
 * Issue #563 — Edit recipe button placement.
 *
 * Drives the seeded user (alice@prisma.io, one recipe) through the reworked
 * placement:
 *  - the read view's edit affordance is a plain edit icon in the navbar (the
 *    former options-menu ellipsis / edit FAB is gone),
 *  - Cancel and Save live on the FAB stack in edit mode,
 *  - Delete moved off the read-view options menu onto the edit form.
 *
 * Screenshots land in `.agent/verify/issue-563`.
 */
test('edit lives in the navbar; delete + cancel/save live on the edit page', async ({
  page
}) => {
  const shot = (name: string) =>
    page.screenshot({ path: `.agent/verify/issue-563/${name}.png` })

  await page.goto('/recipes')
  await page
    .getByText('CREAMY MUSHROOM TOAST', { exact: false })
    .first()
    .click()
  await page.waitForURL(/\/recipes\/.+/)

  // Read view: the edit control is an icon button in the navbar (banner), not a
  // floating action button.
  const navEditButton = page
    .getByRole('banner')
    .getByRole('button', { name: 'Edit recipe' })
  await expect(navEditButton).toBeVisible()
  await shot('read-view-edit-in-navbar')

  // Flip into edit mode from the navbar.
  await navEditButton.click()
  await expect(page.getByLabel('Name')).toBeVisible()
  // The navbar edit icon hides while editing — Cancel/Save take over.
  await expect(navEditButton).toBeHidden()

  // Cancel and Save are floating action buttons on the edit page (bottom-right).
  await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Save' })).toBeVisible()
  // Let the FAB entrance animation (fade + scale in) settle before capturing.
  await page.waitForTimeout(700)
  await shot('edit-mode-cancel-save-fabs')

  // Delete moved onto the edit form. `exact` isolates it from the Facet rows'
  // "Delete <tag>" remove controls.
  const deleteButton = page.getByRole('button', { name: 'Delete', exact: true })
  await expect(deleteButton).toBeVisible()
  await deleteButton.scrollIntoViewIfNeeded()
  await shot('edit-mode-delete-button')

  // The Delete button opens the confirmation dialog.
  await deleteButton.click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByText('Delete recipe')).toBeVisible()
  await shot('delete-confirmation-dialog')
})

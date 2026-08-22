import { test, expect } from '@playwright/test'
import { createPrismaClient } from '~/server/prisma-client'
import { verifyShot } from './verify-shot'

/**
 * Issue #564 — the Recipe delete-cascade moved from the router into the recipes
 * use-case. Drives the real user flow as the seeded user (alice@prisma.io):
 * open a Recipe, flip into edit mode, delete it, confirm, and assert it
 * disappears from `/recipes`. This exercises the cascade end to end (the Recipe
 * plus its Ingredients and Instructions are removed).
 * Screenshots land in `.agent/verify/issue-564`.
 *
 * The spec creates and deletes its OWN Recipe rather than the seeded one. The
 * e2e DB is seeded once per run (`e2e/global-setup.ts`; CI seeds in a separate
 * job step) and specs share it serially, so deleting the seeded Recipe would
 * strip the fixture out from under every alphabetically-later spec that expects
 * it (`recipe-detail-auth`, `recipe-edit`, `recipes`).
 */

const SEED_USERNAME = 'alice@prisma.io'
const FIXTURE_NAME = 'E2E DELETE FIXTURE STEW'
const FIXTURE_SLUG = 'e2e-delete-fixture-stew'

const prisma = createPrismaClient()

/** Remove the fixture Recipe and its children, ignoring what isn't there. */
async function removeFixtureRecipe() {
  const recipe = await prisma.recipe.findUnique({
    where: { slug: FIXTURE_SLUG },
    select: { id: true }
  })
  if (!recipe) return

  await prisma.ingredient.deleteMany({ where: { recipeId: recipe.id } })
  await prisma.instruction.deleteMany({ where: { recipeId: recipe.id } })
  await prisma.recipesOnMessages.deleteMany({ where: { recipeId: recipe.id } })
  await prisma.recipe.delete({ where: { id: recipe.id } })
}

test.beforeEach(async () => {
  // A previous failed run may have left the fixture behind; start clean.
  await removeFixtureRecipe()

  const user = await prisma.user.findUniqueOrThrow({
    where: { username: SEED_USERNAME },
    select: { id: true }
  })

  await prisma.recipe.create({
    data: {
      userId: user.id,
      name: FIXTURE_NAME,
      slug: FIXTURE_SLUG,
      description: 'A throwaway recipe this spec creates so it can delete it.',
      // The /recipes list filters on `saved: true`; the schema defaults it to
      // false, so an unsaved fixture would never render in the grid.
      saved: true,
      ingredients: {
        create: [
          { rawString: '1 can chickpeas, drained' },
          { rawString: '1 tablespoon olive oil' }
        ]
      },
      instructions: {
        create: [{ description: 'Warm the oil, add the chickpeas, simmer.' }]
      }
    }
  })
})

test.afterEach(async () => {
  // The happy path already deleted it through the UI; this covers a mid-test
  // failure so the fixture never leaks into another spec.
  await removeFixtureRecipe()
})

test.afterAll(async () => {
  await prisma.$disconnect()
})

test('deletes a Recipe and removes it from the collection', async ({
  page
}) => {
  const shot = (name: string) =>
    verifyShot(page, `.agent/verify/issue-564/${name}.png`)

  // Open the fixture recipe's detail page. It also appears in the "Recent"
  // strip, so disambiguate with `.first()`.
  await page.goto('/recipes')
  await page.getByText(FIXTURE_NAME, { exact: false }).first().click()
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
  // gone from the grid and the "Recent" strip, and the seeded recipe the rest
  // of the suite relies on is untouched.
  await page.waitForURL(/\/recipes\/?$/)
  await expect(page.getByText(FIXTURE_NAME, { exact: false })).toHaveCount(0)
  await expect(
    page.getByText('CREAMY MUSHROOM TOAST', { exact: false }).first()
  ).toBeVisible()
  await shot('collection-after-delete')

  // The cascade removed the row itself, not just its listing.
  await expect
    .poll(() => prisma.recipe.count({ where: { slug: FIXTURE_SLUG } }))
    .toBe(0)
})

import { test, expect } from '@playwright/test'

/**
 * Issue #458 — AI tool calling: the chat can edit the recipe and add notes when
 * opened on a recipe-detail page. Drives the real flow through the built app:
 * open a saved recipe, open its chat, and issue natural-language action
 * requests. Asserts on the inline confirmation the user sees (the
 * `ToolResultAppMessage` in `app-message.tsx`), which only renders after the
 * tool's server-side execute reports success — i.e. after the DB write landed.
 *
 * Uses a live LLM tool call, so timeouts are generous and assertions target the
 * stable confirmation copy ("Added note to:" / "Updated recipe:") rather than
 * any LLM-authored prose.
 */

/** The seeded recipe (see prisma/seed.ts); its slug carries a random suffix, so
 * we reach the detail page by clicking the card, not by a hard-coded URL. */
const SEEDED_RECIPE = 'CREAMY MUSHROOM TOAST'

/** Wait comfortably past the model round-trip for the action to complete. */
const ACTION_TIMEOUT = 45_000

// Both specs act on the same seeded recipe via a live model call; run them one
// at a time so they don't contend on the shared DB or the model rate limit.
test.describe.configure({ mode: 'serial' })

async function openRecipeChat(page: import('@playwright/test').Page) {
  await page.goto('/recipes')
  await page.getByText(SEEDED_RECIPE, { exact: false }).first().click()
  await page.waitForURL(/\/recipes\/.+/)

  // The recipe-detail page also mounts an Edit FAB with the same shape/classes,
  // so target the chat button by its accessible name rather than a CSS locator.
  await page.getByRole('button', { name: 'Open chat' }).click()

  const input = page.getByPlaceholder(/Ask about/i)
  await expect(input).toBeVisible()
  return input
}

test('chat adds a note to the recipe from its detail page', async ({
  page
}) => {
  const input = await openRecipeChat(page)

  await input.fill(
    'Add a note to this recipe that says: Serve with a crisp green salad.'
  )
  // Submitting the chat form via Enter avoids clashing with the recipe page's
  // own notes form, which also has a submit button.
  await input.press('Enter')

  await expect(page.getByText(/Added note to:/i)).toBeVisible({
    timeout: ACTION_TIMEOUT
  })

  await page.screenshot({
    path: '.agent/verify/issue-458/add-note-confirmation.png',
    fullPage: true
  })
})

test('chat edits the recipe from its detail page', async ({ page }) => {
  const input = await openRecipeChat(page)

  await input.fill(
    'Update this recipe’s description to: A cozy weeknight mushroom toast.'
  )
  await input.press('Enter')

  await expect(page.getByText(/Updated recipe:/i)).toBeVisible({
    timeout: ACTION_TIMEOUT
  })

  await page.screenshot({
    path: '.agent/verify/issue-458/edit-recipe-confirmation.png',
    fullPage: true
  })
})

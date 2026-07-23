import { test, expect } from '@playwright/test'

/**
 * Issue #560 — the chat editRecipe tool now delegates to the editRecipe
 * use-case (same path as the tRPC form edit): one selective diff, one
 * transaction, one re-embed policy. This drives the assistant edit through the
 * built app and asserts on what the user sees:
 *
 *  1. the inline "Updated recipe:" confirmation, which only renders after the
 *     tool's server-side execute reports success — i.e. after the use-case's
 *     transaction committed (user story #2: an assistant edit behaves like a
 *     form edit).
 *  2. the edited text showing up on the recipe-detail view after a reload,
 *     proving the write landed through the shared use-case.
 *
 * Uses a live LLM tool call, so timeouts are generous and assertions target
 * stable app copy / the edited value, never LLM-authored prose.
 */

const SEEDED_RECIPE = 'CREAMY MUSHROOM TOAST'
const NEW_DESCRIPTION = 'A cozy weeknight mushroom toast, ready in minutes.'
const ACTION_TIMEOUT = 45_000

test.describe.configure({ mode: 'serial' })

test('assistant edit of the description lands through the editRecipe use-case', async ({
  page
}) => {
  await page.goto('/recipes')
  await page.getByText(SEEDED_RECIPE, { exact: false }).first().click()
  await page.waitForURL(/\/recipes\/.+/)
  const recipeUrl = page.url()

  await page.getByRole('button', { name: 'Open chat' }).click()
  // Placeholder is "Ask about <recipe>" for a fresh chat and "Follow up…" once
  // a chat has messages (fresh vs resumed within the freshness window, #549) —
  // accept either.
  const input = page.getByPlaceholder(/Ask about|Follow up/i)
  await expect(input).toBeVisible()

  // Another spec may have left a recent conversation on this recipe's chat
  // (still within the 2h freshness window), which would resume here. Start
  // fresh so this test's assistant turn isn't steered by unrelated prior
  // context — mirrors a real user tapping "New chat".
  const newChatButton = page.getByTitle('New chat')
  if (await newChatButton.isVisible()) {
    await newChatButton.click()
    await expect(input).toBeVisible()
  }

  await input.fill(`Update this recipe's description to: ${NEW_DESCRIPTION}`)
  // Submit via Enter to avoid clashing with the recipe page's own notes form.
  await input.press('Enter')

  // The confirmation renders only after the server-side tool -> editRecipe
  // use-case transaction succeeded.
  await expect(page.getByText(/Updated recipe:/i)).toBeVisible({
    timeout: ACTION_TIMEOUT
  })

  await page.screenshot({
    path: '.agent/verify/issue-560/edit-confirmation.png',
    fullPage: true
  })

  // Reload the detail view (reads through tRPC, the cache the tool bypasses) and
  // confirm the edited description actually persisted.
  await page.goto(recipeUrl)
  await expect(page.getByText(NEW_DESCRIPTION)).toBeVisible({
    timeout: ACTION_TIMEOUT
  })

  await page.screenshot({
    path: '.agent/verify/issue-560/edited-description-persisted.png',
    fullPage: true
  })
})

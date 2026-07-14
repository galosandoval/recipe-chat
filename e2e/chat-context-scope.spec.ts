import { test, expect, type Page } from '@playwright/test'

/**
 * Issue #549 — chats are scoped to their Chat Context. Drives the real built app
 * with a live LLM call. Verifies that:
 *  - a recipe's chat keeps its own conversation (recipe-detail context),
 *  - the general `/chat` page shows a separate, blank conversation — the recipe
 *    chat doesn't bleed into it,
 *  - returning to the recipe (within the freshness window) resumes its chat.
 *
 * Anchors the "assistant finished + the exchange persisted" step on the real
 * `chats.upsert` tRPC call (fired from `onFinishMessage` once the assistant
 * reply is complete) rather than any LLM-authored prose, so the resume step is
 * deterministic.
 */

const SEEDED_RECIPE = 'CREAMY MUSHROOM TOAST'
const ACTION_TIMEOUT = 60_000

/** A distinctive user message we can assert on deterministically in the thread. */
const RECIPE_MESSAGE =
  'In one short sentence, suggest a garnish for this dish. Scoped-to-recipe check.'

async function openRecipeChat(page: Page) {
  await page.goto('/recipes')
  await page.getByText(SEEDED_RECIPE, { exact: false }).first().click()
  await page.waitForURL(/\/recipes\/.+/)
  const openChat = page.getByRole('button', { name: 'Open chat' })
  await openChat.waitFor()
  await openChat.click()
  // Placeholder is "Ask about <recipe>" for a fresh chat and "Follow up…" once a
  // chat has messages (fresh vs resumed) — accept either.
  const input = page.getByPlaceholder(/Ask about|Follow up/i)
  await expect(input).toBeVisible()
  return input
}

test('a recipe chat is scoped to its recipe; the general chat stays separate and the recipe chat resumes', async ({
  page
}) => {
  // 1. Recipe-detail chat: send a message and wait for the persisted exchange.
  const input = await openRecipeChat(page)
  const upsertDone = page.waitForResponse(
    (r) => r.url().includes('chats.upsert') && r.request().method() === 'POST',
    { timeout: ACTION_TIMEOUT }
  )
  await input.fill(RECIPE_MESSAGE)
  await input.press('Enter')

  await expect(page.getByText(RECIPE_MESSAGE).first()).toBeVisible()
  // The exchange is persisted (scoped to this recipe) once upsert responds.
  await upsertDone

  await page.screenshot({
    path: '.agent/verify/issue-549/recipe-chat-conversation.png',
    fullPage: true
  })

  // 2. General /chat page: a separate, blank conversation — no bleed-through.
  await page.goto('/chat')
  await expect(page.getByText('Recipe Assistant')).toBeVisible()
  await expect(page.getByText(RECIPE_MESSAGE)).toHaveCount(0)

  await page.screenshot({
    path: '.agent/verify/issue-549/general-chat-separate.png',
    fullPage: true
  })

  // 3. Back to the recipe: its own conversation resumes (within 2h freshness).
  const resumedInput = await openRecipeChat(page)
  await expect(page.getByText(RECIPE_MESSAGE).first()).toBeVisible({
    timeout: ACTION_TIMEOUT
  })
  await expect(resumedInput).toBeVisible()

  await page.screenshot({
    path: '.agent/verify/issue-549/recipe-chat-resumed.png',
    fullPage: true
  })
})

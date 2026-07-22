import { test, expect } from '@playwright/test'

/**
 * Issue #557 — one useChatSession module owns send/stream/persist. Drives the
 * whole Chat turn through the built app to prove the session interface works
 * end to end for a user, regardless of which chat components are mounted:
 *
 *  1. Send a Message and watch the assistant stream Recipe Option cards.
 *  2. Tap Generate on a card and get the full Recipe expanded in place.
 *
 * Uses a live LLM tool call (generateRecipeOptions then expandRecipe), so
 * timeouts are generous and assertions target stable UI copy ("Generate", the
 * "Collapse" control on an expanded Recipe) rather than model-authored prose.
 */

/** Wait comfortably past the model round-trip. */
const STREAM_TIMEOUT = 60_000

test('sends a Message, streams Recipe Options, and expands one on Generate', async ({
  page
}) => {
  test.setTimeout(150_000)
  await page.goto('/chat')

  // Placeholder is "Ask about a recipe" for a fresh chat and "Follow up…" if an
  // earlier spec's chat on this context is still within its freshness window
  // (#549) — accept either.
  const input = page.getByPlaceholder(/Ask about a recipe|Follow up/i)
  await expect(input).toBeVisible()

  // Be explicit so the model proposes options immediately instead of asking
  // clarifying questions (the system prompt clarifies vague requests).
  await input.fill(
    'Propose 3 specific quick vegetarian pasta dinner recipes now. Do not ask any questions.'
  )
  await input.press('Enter')

  // The assistant streams Recipe Option cards, each with a Generate button.
  const generateButton = page.getByRole('button', { name: 'Generate' }).first()
  await expect(generateButton).toBeVisible({ timeout: STREAM_TIMEOUT })

  await page.screenshot({
    path: '.agent/verify/issue-557/recipe-options.png',
    fullPage: true
  })

  // Let the first turn's Chat upsert settle so its persisted chatId is set
  // before the expand starts (otherwise a second chatId races the message-load
  // query and blanks the screen).
  await page.waitForTimeout(4000)

  // Tapping Generate expands the tapped Recipe Option into a full Recipe — its
  // ingredients/instructions render with a Collapse control.
  await generateButton.click()

  await expect(page.getByRole('button', { name: 'Collapse' })).toBeVisible({
    timeout: STREAM_TIMEOUT
  })

  await page.screenshot({
    path: '.agent/verify/issue-557/generated-recipe.png',
    fullPage: true
  })
})

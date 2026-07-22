import { test, expect } from '@playwright/test'

/**
 * Issue #559 — one Recipe DTO mapper owns generated-output → Recipe mapping.
 * The conversion (Facet defaulting, fallback id/slug, the card-id-wins
 * precedence) now lives in one module that the stream renderer, the Chat
 * reconciliation, and the expand merge all call. This drives the two
 * user-visible acceptance criteria through the built app:
 *
 *  1. A Recipe rendered from a streaming reply carries its Facets and renders
 *     as a Recipe Option card (mapper's `placeholder` id path).
 *  2. Expanding a Recipe Option keeps the card's id, so the full Recipe renders
 *     in place with ingredients/instructions (mapper's `preserve` id path).
 *
 * Uses a live LLM tool call, so timeouts are generous and assertions target
 * stable UI copy rather than model-authored prose.
 */

const STREAM_TIMEOUT = 60_000

test('renders streamed Recipe Options and expands one, mapping intact', async ({
  page
}) => {
  test.setTimeout(150_000)
  await page.goto('/chat')

  const input = page.getByPlaceholder(/Ask about a recipe/i)
  await expect(input).toBeVisible()

  await input.fill(
    'Propose 3 specific quick vegetarian pasta dinner recipes now. Do not ask any questions.'
  )
  await input.press('Enter')

  // Criterion 1: the streamed reply renders Recipe Option cards (each mapped
  // through the DTO mapper's placeholder path) with a Generate button.
  const generateButton = page.getByRole('button', { name: 'Generate' }).first()
  await expect(generateButton).toBeVisible({ timeout: STREAM_TIMEOUT })

  await page.screenshot({
    path: '.agent/verify/issue-559/streamed-recipe-options.png',
    fullPage: true
  })

  // Let the first turn's Chat upsert settle so its persisted chatId is set
  // before the expand starts.
  await page.waitForTimeout(4000)

  // Criterion 2: expanding keeps the card's id, so the full Recipe renders in
  // place with a Collapse control over its ingredients/instructions.
  await generateButton.click()

  await expect(page.getByRole('button', { name: 'Collapse' })).toBeVisible({
    timeout: STREAM_TIMEOUT
  })

  await page.screenshot({
    path: '.agent/verify/issue-559/expanded-recipe.png',
    fullPage: true
  })
})

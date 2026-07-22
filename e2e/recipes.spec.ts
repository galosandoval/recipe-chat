import { test, expect } from '@playwright/test'

/**
 * Smoke spec proving the harness end to end: an authenticated session (from the
 * `setup` project) can load the recipes page and see the seeded recipe. This is
 * the first durable e2e spec; the agent's verify phase adds issue-specific specs
 * alongside it.
 */
test('authenticated user sees their seeded recipe on /recipes', async ({
  page
}) => {
  await page.goto('/recipes')

  // The seeded user (alice@prisma.io) has one recipe; its name renders both in
  // the main grid and the "Recent" strip, so disambiguate with `.first()`.
  await expect(
    page.getByText('CREAMY MUSHROOM TOAST', { exact: false }).first()
  ).toBeVisible()
})

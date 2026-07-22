import { test, expect } from '@playwright/test'
import { verifyShot } from './verify-shot'

/**
 * Issue #545 — the Recipe detail page threw a swallowed `UNAUTHORIZED` on every
 * authenticated load, because the client `recipes.bySlug` suspense query
 * refetched during the server-render pass without the session cookie.
 *
 * This drives the real flow as the seeded user (alice@prisma.io, one recipe):
 * open the recipe, then do a *fresh* full-document load of its detail URL (the
 * exact server-render path that used to fault) and assert the page renders the
 * recipe with no auth error surfacing in the browser and no failed
 * `recipes.bySlug` request. Screenshots land in `.agent/verify/issue-545`.
 */
test('loads the Recipe detail page for an authed user with no UNAUTHORIZED', async ({
  page
}) => {
  const shot = (name: string) =>
    verifyShot(page, `.agent/verify/issue-545/${name}.png`)

  // Collect anything that would signal the #545 fault: a console error naming
  // the auth failure, or a failed `recipes.bySlug` HTTP response.
  const consoleErrors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  const failedRecipeCalls: string[] = []
  page.on('response', (res) => {
    if (res.url().includes('/api/trpc/recipes.bySlug') && res.status() >= 400) {
      failedRecipeCalls.push(`${res.status()} ${res.url()}`)
    }
  })

  // Find the seeded recipe from the list and capture its detail URL. It also
  // appears in the "Recent" strip, so disambiguate with `.first()`.
  await page.goto('/recipes')
  await page
    .getByText('CREAMY MUSHROOM TOAST', { exact: false })
    .first()
    .click()
  await page.waitForURL(/\/recipes\/.+/)
  const detailUrl = page.url()

  // The fresh, full-document load is what exercised the server-render refetch.
  await page.goto(detailUrl, { waitUntil: 'networkidle' })

  // The recipe renders for the authenticated user...
  await expect(
    page.getByRole('heading', { name: /CREAMY MUSHROOM TOAST/i })
  ).toBeVisible()
  await expect(page.getByRole('button', { name: 'Edit recipe' })).toBeVisible()
  // ...and nothing fell back to the error boundary.
  await expect(page.getByText('Something went wrong')).toHaveCount(0)
  await shot('recipe-detail-loaded')

  // The bug's fingerprints must be absent: no auth error in the console and no
  // failed bySlug request.
  expect(
    consoleErrors.filter((e) => /unauthorized/i.test(e)),
    `unexpected UNAUTHORIZED console errors: ${consoleErrors.join('\n')}`
  ).toHaveLength(0)
  expect(
    failedRecipeCalls,
    `unexpected failed recipes.bySlug calls: ${failedRecipeCalls.join('\n')}`
  ).toHaveLength(0)
})

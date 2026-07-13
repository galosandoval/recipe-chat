import { test, expect } from '@playwright/test'

/**
 * Issue #542 — shared, animated FAB stack.
 *
 * The Recipe detail page is the one screen where two FABs are simultaneously
 * visible (Edit + chat-drawer). It's the strongest end-to-end proof that the
 * stack coordinates multiple FABs without hardcoded `bottom-*` offsets:
 *
 *  - both FABs render in one clean, gapless vertical column (story 5);
 *  - they're ordered by priority — the chat FAB sits closest to the thumb,
 *    the Edit FAB directly above it (Implementation Decisions / prototype);
 *  - each FAB's click behavior is unchanged after migration (story 14): the
 *    Edit FAB still flips the page into inline edit mode.
 *
 * Screenshots land in `.agent/verify/issue-542`.
 */
test('stacks the Edit and chat FABs and preserves their click behavior', async ({
  page
}) => {
  const shot = (name: string) =>
    page.screenshot({ path: `.agent/verify/issue-542/${name}.png` })

  // Open the seeded recipe's detail page (alice@prisma.io has one recipe).
  await page.goto('/recipes')
  await page.getByText('CREAMY MUSHROOM TOAST', { exact: false }).click()
  await page.waitForURL(/\/recipes\/.+/)

  // Both FABs coexist in the shared stack — no page computes the other's offset.
  const editFab = page.getByRole('button', { name: 'Edit recipe' })
  const chatFab = page.getByRole('button', { name: 'Open chat' })
  await expect(editFab).toBeVisible()
  await expect(chatFab).toBeVisible()

  // Priority order: the chat FAB (priority 0) sits below the Edit FAB
  // (priority 1), i.e. closest to the thumb, with the Edit FAB directly above.
  const editBox = await editFab.boundingBox()
  const chatBox = await chatFab.boundingBox()
  expect(editBox).not.toBeNull()
  expect(chatBox).not.toBeNull()
  expect(editBox!.y).toBeLessThan(chatBox!.y)

  // Wait for the stack's entrance animation (route-transition delay + fade) to
  // settle so the proof shot shows the fully-opaque FABs, not a mid-fade frame.
  await expect
    .poll(() =>
      editFab.evaluate((el) => getComputedStyle(el.parentElement!).opacity)
    )
    .toBe('1')
  await shot('stacked-fabs')

  // Click behavior is unchanged: the Edit FAB still flips into inline edit mode.
  // (It's a FAB with an entrance animation, so force past the stability check.)
  await editFab.click({ force: true })
  await expect(page.getByLabel('Name')).toBeVisible()
  await shot('edit-fab-opens-edit-mode')
})

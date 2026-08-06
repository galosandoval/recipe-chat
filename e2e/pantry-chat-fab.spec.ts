import { test, expect } from '@playwright/test'
import { verifyShot } from './verify-shot'

/**
 * Issue #581 — the pantry chat FAB should sit higher on mobile.
 *
 * On `/lists` a sticky add-item footer input is always present (both the list
 * and pantry tabs). On a mobile viewport the shared FAB stack used to rest at
 * `bottom-20`, which overlapped that input, hiding the chat button behind it.
 * The stack now lifts to `bottom-32` on `/lists`, clearing the footer so the
 * chat FAB is fully tappable above the pantry input.
 *
 * Screenshots land in `.agent/verify/issue-581`.
 */

// The bug and its fix are only observable on a narrow (mobile) viewport, where
// the FAB uses its `bottom-*` offset rather than the `sm:bottom-6` desktop one.
test.use({ viewport: { width: 390, height: 844 } })

test('keeps the chat FAB above the pantry add-item input on mobile', async ({
  page
}) => {
  const shot = (name: string) =>
    verifyShot(page, `.agent/verify/issue-581/${name}.png`)

  // Land directly on the pantry tab (seeded user alice@prisma.io).
  await page.goto('/lists?tab=pantry')

  // The always-present pantry footer input and the chat FAB both render.
  const pantryInput = page.getByPlaceholder('e.g. 2 kg chicken breast')
  const chatFab = page.getByRole('button', { name: 'Open chat' })
  await expect(pantryInput).toBeVisible()
  await expect(chatFab).toBeVisible()

  // Let the stack's entrance animation settle so bounding boxes are final.
  await expect
    .poll(() =>
      chatFab.evaluate((el) =>
        Number(getComputedStyle(el.parentElement!).opacity)
      )
    )
    .toBeGreaterThan(0.99)

  // The chat FAB must clear the footer input entirely: its bottom edge sits at
  // or above the input's top edge, so it never overlaps (and thus never hides)
  // the add-item field.
  const fabBox = await chatFab.boundingBox()
  const inputBox = await pantryInput.boundingBox()
  expect(fabBox).not.toBeNull()
  expect(inputBox).not.toBeNull()
  expect(fabBox!.y + fabBox!.height).toBeLessThanOrEqual(inputBox!.y)

  await shot('pantry-chat-fab-cleared')
})

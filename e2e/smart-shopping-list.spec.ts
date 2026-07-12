import { test, expect, type Page } from '@playwright/test'

/**
 * Smart Shopping List (#417). Drives the real app as the seeded user to prove
 * the enhanced shopping-list aggregation: ingredients with the same item merge
 * across compatible units, the merged total is editable, and unmeasured ("to
 * taste") items are kept as their own advisory line.
 *
 * Items are added through the list footer input (`#add-to-list-input`); the
 * seeded user starts with an empty list, so the flow is deterministic.
 */

const SCREENSHOT_DIR = '.agent/verify/issue-417'

async function addListItem(page: Page, text: string) {
  const input = page.locator('#add-to-list-input')
  await input.click()
  await input.fill(text)
  // Wait for the add mutation to round-trip so the item is persisted before the
  // next action (or a reload) can race it.
  await Promise.all([
    page.waitForResponse((res) => res.url().includes('lists.add')),
    input.press('Enter')
  ])
  await expect(input).toHaveValue('')
}

test('merges ingredients across units, keeps "to taste" separate, and edits totals', async ({
  page
}) => {
  await page.goto('/lists?tab=list')

  // Three "flour" lines in compatible volume units. With smart aggregation they
  // collapse into a single merged line (1 cup + 2 cups + 4 tbsp).
  await addListItem(page, '1 cup flour')
  await addListItem(page, '2 cups flour')
  await addListItem(page, '4 tablespoons flour')

  // A measured single item used to prove manual quantity adjustment is exact.
  await addListItem(page, '5 cups sugar')

  // An unmeasured edge case: must stay its own line with no quantity editor.
  await addListItem(page, 'salt to taste')

  // Wait for the server round-trip + re-aggregation to settle.
  await page.reload()

  // AC1/AC2/AC3: the three flour entries merged into exactly one line.
  await expect(page.getByText('flour', { exact: false })).toHaveCount(1)

  // The merged flour line exposes an editable quantity (the summed total).
  const flourQty = page.getByRole('spinbutton', { name: /flour/i })
  await expect(flourQty).toBeVisible()
  const mergedValue = Number(await flourQty.inputValue())
  expect(mergedValue).toBeGreaterThan(2)

  // AC6: "salt to taste" stays a separate, unmeasured line (no number input).
  await expect(page.getByText('salt to taste', { exact: false })).toBeVisible()
  await expect(page.getByRole('spinbutton', { name: /salt/i })).toHaveCount(0)

  await page.screenshot({ path: `${SCREENSHOT_DIR}/merged-and-edge-cases.png` })

  // AC4: manually adjust a merged/measured total and confirm it persists.
  const sugarQty = page.getByRole('spinbutton', { name: /sugar/i })
  await expect(sugarQty).toHaveValue('5')
  await sugarQty.fill('12')
  await Promise.all([
    page.waitForResponse((res) => res.url().includes('lists.setQuantities')),
    sugarQty.press('Enter')
  ])

  await page.reload()
  const sugarAfter = page.getByRole('spinbutton', { name: /sugar/i })
  await expect(sugarAfter).toHaveValue('12')

  await page.screenshot({ path: `${SCREENSHOT_DIR}/manual-adjust.png` })
})

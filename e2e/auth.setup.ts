import { test as setup, expect } from '@playwright/test'
import { STORAGE_STATE } from '../playwright.config'

/**
 * Seeded credentials. Must match `prisma/seed.ts` (`SEED_USER`) — the DB is
 * seeded with this user (bcrypt-hashed password) before the e2e run, so logging
 * in here exercises the real Credentials provider.
 */
const SEED_USER = {
  email: 'alice@prisma.io',
  password: 'Admin@123'
}

/**
 * Logs in once through the real UI and saves the authenticated session to
 * `STORAGE_STATE`. Every spec in the `chromium` project reuses that state via
 * its `storageState` setting, so no spec re-scripts login or boot.
 */
setup('authenticate', async ({ page }) => {
  await page.goto('/')

  // Login lives in the navbar's settings dropdown (the only banner button for an
  // anonymous user), not as a top-level button. Open it, then pick "Login" to
  // bring up the dialog and submit the form.
  await page.getByRole('banner').getByRole('button').click()
  await page.getByRole('menuitem', { name: 'Login' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel('Email').fill(SEED_USER.email)
  await dialog.getByLabel('Password').fill(SEED_USER.password)
  await dialog.getByRole('button', { name: 'Login' }).click()

  // A successful credentials sign-in redirects to /chat.
  await page.waitForURL('**/chat')
  await expect(page).toHaveURL(/\/chat/)

  await page.context().storageState({ path: STORAGE_STATE })
})

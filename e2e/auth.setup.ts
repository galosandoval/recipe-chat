import { test as setup, expect } from '@playwright/test'
import { STORAGE_STATE } from '../playwright.config'

// Shared auth fixture (#523). Logs in once as the seeded user and saves the
// session to STORAGE_STATE; the `chromium` project loads that state so every
// spec runs as a genuine authenticated session without re-scripting login.
//
// The seeded user comes from `prisma/seed.ts` (`bun run seed`), which both the
// verify phase and the PR `e2e` job run against the service DB before this.
const SEEDED_USER = {
  email: process.env.E2E_USER_EMAIL ?? 'alice@prisma.io',
  password: process.env.E2E_USER_PASSWORD ?? 'Admin@123'
}

setup('authenticate as the seeded user', async ({ page }) => {
  await page.goto('/')

  // The unauthenticated chat welcome surfaces a "Login" link that opens the
  // login drawer/dialog.
  await page.getByRole('button', { name: 'Login' }).click()

  await page.getByLabel('Email').fill(SEEDED_USER.email)
  await page.getByLabel('Password').fill(SEEDED_USER.password)
  await page.getByRole('button', { name: 'Login' }).last().click()

  // A successful login routes to /chat; wait for it before saving the session.
  await page.waitForURL('**/chat')

  await page.context().storageState({ path: STORAGE_STATE })
})

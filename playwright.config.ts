import { defineConfig, devices } from '@playwright/test'
import * as path from 'node:path'

/**
 * Playwright e2e harness (#523). This is the project's end-to-end test runner —
 * a deliberate, documented exception to the repo's "tests are colocated, no
 * `__tests__/`" convention: e2e specs span features and live under `e2e/`.
 *
 * Run with `bun run test:e2e`. The suite is intentionally NOT part of the
 * default `bun run test` gate, so the unit/integration gate (and the agent's
 * per-commit loop) stays fast and never boots a browser. e2e runs only (a) in
 * the agent's verify phase and (b) the path-filtered `e2e` CI job.
 *
 * The `webServer` block builds and boots the real app, so a local/CI run is one
 * command. Specs authenticate once via the `setup` project (see
 * `e2e/auth.setup.ts`), which writes a `storageState` reused by every spec.
 */

/** Where the authenticated session (cookies) is cached between specs. */
export const STORAGE_STATE = path.join(
  __dirname,
  'e2e/.auth/storage-state.json'
)

const PORT = Number(process.env.PORT ?? 3000)
const BASE_URL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`

export default defineConfig({
  testDir: './e2e',
  // Resets + reseeds the dedicated e2e DB before anything runs (local only; CI
  // preps its service DB with explicit steps). See e2e/global-setup.ts.
  globalSetup: './e2e/global-setup.ts',
  // Build/boot/browser is slow; give specs room but keep a hard ceiling.
  timeout: 60_000,
  expect: { timeout: 10_000 },
  // Never `.only` past CI; let flakes retry there but fail fast locally.
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',

  use: {
    baseURL: BASE_URL,
    // Proof is a built-in: capture a screenshot for every test, a trace on the
    // first retry, and video only when a test fails. Agent specs additionally
    // take explicit `page.screenshot()` shots into `.agent/verify/issue-<N>/`.
    screenshot: 'on',
    trace: 'on-first-retry',
    video: 'retain-on-failure'
  },

  projects: [
    // Logs in once as the seeded user and saves the session to STORAGE_STATE.
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: STORAGE_STATE },
      dependencies: ['setup']
    }
  ],

  // Builds + boots the real app and waits for it to be reachable. Reuses an
  // already-running dev/prod server locally; always starts fresh in CI.
  webServer: {
    command: 'bun run build && bun run start',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    // First run pays for `next build`; allow generous startup time.
    timeout: 180_000,
    stdout: 'pipe',
    stderr: 'pipe'
  }
})

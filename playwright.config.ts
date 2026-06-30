import { defineConfig, devices } from '@playwright/test'

// Playwright e2e harness (#523). This is the project's first-class end-to-end
// test runner — not a throwaway script. The agent's verify phase and the
// path-filtered PR `e2e` job both run it via `bun run test:e2e`. It is kept out
// of the default `bun run test` gate so the unit/integration loop stays fast and
// never boots a browser.
//
// Specs live in the top-level `e2e/` directory — a deliberate, documented
// exception to the repo's "tests are colocated, no `__tests__/`" convention,
// because e2e specs span features rather than sitting beside one prod file.

const PORT = Number(process.env.PORT ?? 3000)
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${PORT}`

// Authenticated session, produced once by the `setup` project and reused across
// specs so each spec exercises a genuine logged-in session without re-scripting
// login. Gitignored — it holds session cookies and is regenerated each run.
export const STORAGE_STATE = 'e2e/.auth/user.json'

export default defineConfig({
  testDir: './e2e',
  // Proof is a side effect of running a real test: capture on, traces/video on
  // failure so a flaky boot still leaves evidence behind.
  use: {
    baseURL,
    screenshot: 'on',
    trace: 'on-first-retry',
    video: 'retain-on-failure'
  },
  // A little flake tolerance in CI; none locally so failures are loud.
  retries: process.env.CI ? 1 : 0,
  // Be patient: app boot + browser is slow on a cold CI runner.
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',

  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: STORAGE_STATE },
      dependencies: ['setup']
    }
  ],

  // Build + boot the app and wait for it to answer, so a local/CI `test:e2e`
  // run is one command against the seeded service DB.
  webServer: {
    command: 'bun run build && bun run start',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    // The build dominates this; keep it generous for a cold runner.
    timeout: 180_000,
    stdout: 'pipe',
    stderr: 'pipe'
  }
})

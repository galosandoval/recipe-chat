import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './'
})

// Add any custom config to be passed to Jest
const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  // SWC rewrites `~/...` in import statements, but jest.mock()'s string argument
  // is not rewritten — map the tsconfig `~` alias so both resolve consistently.
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/src/$1'
  },
  // Ignore nested worktree copies so Haste doesn't see duplicate package.json.
  modulePathIgnorePatterns: ['<rootDir>/.claude/worktrees/'],
  // Playwright specs under e2e/ also match *.spec.ts; they are run by Playwright
  // (`bun run test:e2e`), never Jest. Keep them out of the unit/integration gate.
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/e2e/'],
  // Only treat *.test/*.spec files as suites, so test helpers can live in
  // __tests__ dirs without being mistaken for empty test files.
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts']
}

/**
 * ESM-only packages that must go through the SWC transform.
 *
 * `react-markdown` and its unified/remark/micromark dependency chain publish
 * ESM only, so importing any component that renders markdown fails with
 * "Unexpected token 'export'" while node_modules stays untransformed.
 */
const ESM_ONLY_PACKAGES = [
  'react-markdown',
  'remark-.*',
  'mdast-.*',
  'micromark.*',
  'unified',
  'unist-.*',
  'hast-.*',
  'vfile.*',
  'bail',
  'trough',
  'devlop',
  'zwitch',
  'ccount',
  'escape-string-regexp',
  'longest-streak',
  'markdown-table',
  'trim-lines',
  'is-plain-obj',
  'web-namespaces',
  'html-url-attributes',
  'property-information',
  'space-separated-tokens',
  'comma-separated-tokens',
  'character-entities.*',
  'decode-named-character-reference',
  'estree-util-is-identifier-name'
].join('|')

/**
 * Widens next/jest's "don't transform node_modules" pattern to let
 * {@link ESM_ONLY_PACKAGES} through.
 *
 * next/jest only lets a custom config *append* to transformIgnorePatterns,
 * which cannot help: Jest skips a file matching any pattern, so its own
 * node_modules pattern always wins. That pattern is either a bare
 * '/node_modules/' or an allowlist of the form '/node_modules/(?!(a|b)/)' —
 * rewrite whichever shape is generated so the markdown chain is transformed.
 */
const allowEsmPackages = (pattern: string) => {
  if (pattern === '/node_modules/') {
    return `/node_modules/(?!(${ESM_ONLY_PACKAGES})/)`
  }
  return pattern.replace(
    /\(\?!\(([^)]*)\)\/\)/,
    `(?!($1|${ESM_ONLY_PACKAGES})/)`
  )
}

// createJestConfig is exported this way to ensure that next/jest can load the
// Next.js config which is async.
const withNextConfig = createJestConfig(config)

const resolveConfig = async () => {
  const jestConfig = await withNextConfig()

  return {
    ...jestConfig,
    transformIgnorePatterns: (jestConfig.transformIgnorePatterns ?? []).map(
      allowEsmPackages
    )
  }
}

export default resolveConfig

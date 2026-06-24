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
  // Only treat *.test/*.spec files as suites, so test helpers can live in
  // __tests__ dirs without being mistaken for empty test files.
  testMatch: ['**/?(*.)+(spec|test).[jt]s?(x)']
  // Add more setup options before each test is run
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config)

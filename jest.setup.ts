import { TextEncoder, TextDecoder } from 'node:util'

// Backend integration suites hit a real Postgres DB — the use-case/data-access
// layer under src/server/api/** and the route-handler tests under src/app/api/**
// (e.g. the chat tools). Jest runs test files in parallel workers by default, so
// their concurrent writes and truncates against the shared DB deadlock (40P01)
// or clobber each other's rows. Serialize every DB-touching test behind one
// cross-worker advisory lock so even a bare `npx jest` (full parallel run) is
// safe; non-DB unit suites stay parallel because the lock module is only loaded
// for tests under those backend paths. The lock's own meta-test drives
// acquire/release itself, so it opts out of the auto-serialization that would
// otherwise double-acquire the same session.
const isIntegrationTest = () => {
  const path = (expect.getState().testPath ?? '').replace(/\\/g, '/')
  const isBackendPath =
    path.includes('/server/api/') || path.includes('/app/api/')
  return isBackendPath && !path.endsWith('/test-db-lock.test.ts')
}

beforeEach(async () => {
  if (!isIntegrationTest()) return
  const { acquireDbSerialLock } = await import('~/server/api/test-db-lock')
  await acquireDbSerialLock()
})

afterEach(async () => {
  if (!isIntegrationTest()) return
  const { releaseDbSerialLock } = await import('~/server/api/test-db-lock')
  await releaseDbSerialLock()
})

afterAll(async () => {
  if (!isIntegrationTest()) return
  const { disconnectDbSerialLock } = await import('~/server/api/test-db-lock')
  await disconnectDbSerialLock()
})

// Motion animations are no-ops under test: jsdom has no real animation timing,
// so we render `motion.*` elements as plain DOM and let `AnimatePresence` render
// its children directly. Presence is driven by the `open && ...` guards in the
// UI wrappers, so closing a primitive unmounts its content synchronously instead
// of waiting on an exit animation that would never resolve in jsdom.
jest.mock('motion/react', () => {
  const React = require('react') as typeof import('react')

  /** Props that only mean something to Motion; stripped before hitting the DOM. */
  const MOTION_PROPS = new Set([
    'initial',
    'animate',
    'exit',
    'variants',
    'transition',
    'custom',
    'layout',
    'layoutId',
    'drag',
    'whileHover',
    'whileTap',
    'whileFocus',
    'whileInView',
    'whileDrag',
    'viewport',
    'onAnimationStart',
    'onAnimationComplete',
    'onUpdate',
    'onExitComplete'
  ])

  const createMotionComponent = (tag: string) =>
    React.forwardRef(function MotionMock(
      props: Record<string, unknown>,
      ref: React.Ref<unknown>
    ) {
      const domProps: Record<string, unknown> = {}
      for (const key of Object.keys(props)) {
        if (key === 'style') {
          // Drop Motion transform shorthands (x/y/scale/rotate) that aren't CSS.
          const { x, y, scale, rotate, ...rest } = props.style as Record<
            string,
            unknown
          >
          domProps.style = rest
        } else if (!MOTION_PROPS.has(key)) {
          domProps[key] = props[key]
        }
      }
      return React.createElement(tag, { ...domProps, ref })
    })

  // Cache components per tag so `motion.div` is a stable type across renders.
  // Without this, every access returns a fresh component, so React remounts the
  // element each render and Radix's presence ref loops into "max update depth".
  const cache = new Map<string, React.ElementType>()
  const motion = new Proxy(
    {},
    {
      get: (_target, tag: string) => {
        if (!cache.has(tag)) cache.set(tag, createMotionComponent(tag))
        return cache.get(tag)
      }
    }
  )

  return {
    motion,
    AnimatePresence: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    MotionConfig: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    useReducedMotion: () => false
  }
})

// jsdom does not provide TextEncoder/TextDecoder, which some deps (cuid2 via
// @noble/hashes) require at import time. Polyfill them for the test environment.
if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = TextEncoder
}
if (typeof globalThis.TextDecoder === 'undefined') {
  globalThis.TextDecoder = TextDecoder as typeof globalThis.TextDecoder
}

// jsdom does not implement matchMedia, which `useMediaQuery` (and anything built
// on DrawerDialog) calls. Default to a desktop match so responsive components
// render their desktop branch under test.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: true,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false
    }) as unknown as MediaQueryList
}

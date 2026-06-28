import { TextEncoder, TextDecoder } from 'node:util'

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

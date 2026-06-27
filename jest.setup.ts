import { TextEncoder, TextDecoder } from 'node:util'

// jsdom does not provide TextEncoder/TextDecoder, which some deps (cuid2 via
// @noble/hashes) require at import time. Polyfill them for the test environment.
if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = TextEncoder
}
if (typeof globalThis.TextDecoder === 'undefined') {
  globalThis.TextDecoder = TextDecoder as typeof globalThis.TextDecoder
}

/**
 * @jest-environment node
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  AA_TEXT,
  DECORATIVE_MIN,
  contrastRatio,
  isInGamut,
  parseOklch,
  type Oklch
} from '~/lib/contrast'

/**
 * Checks the palette in `globals.css` holds together.
 *
 * Everything here is derived from the token names themselves rather than from
 * a hand-kept list of which colour sits on which — a transcription of today's
 * markup would go stale silently, passing because a pair went unlisted rather
 * than because it was legible.
 */

/** Pulls the `--token: value` declarations out of one CSS rule block. */
const readTokens = (css: string, selector: string) => {
  const block = new RegExp(`${selector}\\s*\\{([\\s\\S]*?)\\n\\}`).exec(css)
  if (!block) throw new Error(`No ${selector} block in globals.css`)

  const tokens: Record<string, Oklch> = {}
  for (const [, name, value] of block[1].matchAll(/--([\w-]+):\s*([^;]+);/g)) {
    const color = parseOklch(value)
    if (color) tokens[name] = color
  }
  return tokens
}

const css = readFileSync(join(__dirname, 'globals.css'), 'utf8')
const light = readTokens(css, ':root')
const dark = readTokens(css, '\\.dark')

/**
 * Surfaces content is drawn on. `--muted-foreground` is general-purpose
 * secondary text and lands on any of them, so it owes AA everywhere.
 */
const SURFACES = ['background', 'bubble', 'card', 'popover', 'muted', 'accent']

/** Container/content pairs, as `[outer, inner]` — see the contrast test. */
const NESTED_SURFACES: [outer: string, inner: string][] = [
  // message.tsx renders a Card (`bg-card`) inside the assistant bubble.
  ['bubble', 'card']
]

describe.each([
  ['light', light],
  ['dark', dark]
])('%s theme', (_mode, tokens) => {
  const at = (name: string) => {
    const token = tokens[name]
    if (!token) throw new Error(`Missing token --${name}`)
    return token
  }
  const ratio = (foreground: string, background: string) =>
    contrastRatio(at(foreground), at(background))

  /**
   * `--x-foreground` names the text colour for `--x`, so the pairing is a fact
   * about the names and needs no list. This is what catches a `--x-foreground`
   * that components reference but the palette never defines.
   */
  const foregroundPairs = Object.keys(tokens)
    .filter((name) => name.endsWith('-foreground'))
    .map((name) => [name, name.replace(/-foreground$/, '')] as const)
    .filter(([, base]) => base in tokens)

  it('names a base token for every -foreground token', () => {
    const orphans = Object.keys(tokens)
      .filter((name) => name.endsWith('-foreground'))
      .filter((name) => !(name.replace(/-foreground$/, '') in tokens))

    expect(orphans).toEqual([])
  })

  it.each(foregroundPairs)('--%s meets AA on --%s', (foreground, base) => {
    expect(ratio(foreground, base)).toBeGreaterThanOrEqual(AA_TEXT)
  })

  it.each(SURFACES.map((name) => [name]))(
    '--muted-foreground meets AA on --%s',
    (surface) => {
      expect(ratio('muted-foreground', surface)).toBeGreaterThanOrEqual(AA_TEXT)
    }
  )

  it.each(SURFACES.map((name) => [name]))(
    '--border stays visible on --%s',
    (surface) => {
      expect(ratio('border', surface)).toBeGreaterThanOrEqual(DECORATIVE_MIN)
    }
  )

  it.each(Object.keys(tokens).map((name) => [name]))(
    '--%s is inside the sRGB gamut',
    (name) => {
      // OKLCH can name colours sRGB cannot show. Rendering clamps each channel
      // independently, which collapses distinct colours onto one pixel — this
      // is what once painted --primary and --destructive identically.
      expect(isInGamut(at(name))).toBe(true)
    }
  )

  /**
   * Surfaces are meant to be one colour at different lightnesses, so a card
   * reads as the page lifted rather than as a second, slightly-off colour laid
   * on top. Only `l` may differ from `--background`.
   */
  it.each(SURFACES.filter((name) => name !== 'background').map((n) => [n]))(
    '--%s is --background at another lightness',
    (name) => {
      expect(at(name).c).toBeCloseTo(at('background').c, 5)
      expect(at(name).h).toBeCloseTo(at('background').h, 5)
      expect(at(name).l).not.toBeCloseTo(at('background').l, 5)
    }
  )

  /**
   * Content pops by returning to the page's own lightness while the container
   * holds a contrasting mid-tone — a card on a bubble reads as the page
   * showing through, not as another layer stacked on top.
   *
   * Stated as distance from `--background` because the direction flips between
   * themes: in light the card is *lighter* than the bubble, in dark it is
   * *darker*. What holds in both is that the inner surface is the one nearer
   * the page. Asserting "inner is lighter" instead reads correctly in light
   * and flattens dark into a stack of ever-lighter greys.
   */
  it.each(NESTED_SURFACES)(
    "returns --%s's nested --%s toward the page",
    (outer, inner) => {
      const from = (name: string) => Math.abs(at(name).l - at('background').l)

      expect(from(inner)).toBeLessThan(from(outer))
    }
  )

  it('keeps the hover tint distinguishable from the surface it covers', () => {
    // chat-history.tsx renders `bg-card hover:bg-accent`; a hover must lighten
    // in dark and darken in light, never land back on --card.
    expect(at('accent').l).not.toBeCloseTo(at('card').l, 2)
  })

  it('defines every token the other theme defines', () => {
    const other = tokens === light ? dark : light
    expect(Object.keys(tokens).sort()).toEqual(Object.keys(other).sort())
  })
})

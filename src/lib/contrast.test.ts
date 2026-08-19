import { contrastRatio, isInGamut, oklchToSrgb, parseOklch } from './contrast'

describe('parseOklch', () => {
  it('parses an oklch triple', () => {
    expect(parseOklch('oklch(0.62 0.25 28)')).toEqual({
      l: 0.62,
      c: 0.25,
      h: 28,
      alpha: 1
    })
  })

  it('parses a percentage alpha', () => {
    expect(parseOklch('oklch(1 0 0 / 12%)')).toEqual({
      l: 1,
      c: 0,
      h: 0,
      alpha: 0.12
    })
  })

  it('parses a decimal alpha', () => {
    expect(parseOklch('oklch(1 0 0 / 0.5)')?.alpha).toBe(0.5)
  })

  it('returns null for a non-oklch value', () => {
    expect(parseOklch('#fff')).toBeNull()
  })
})

describe('oklchToSrgb', () => {
  it('maps lightness 1 to white', () => {
    const { r, g, b } = oklchToSrgb({ l: 1, c: 0, h: 0, alpha: 1 })
    expect(r).toBeCloseTo(1, 2)
    expect(g).toBeCloseTo(1, 2)
    expect(b).toBeCloseTo(1, 2)
  })

  it('maps lightness 0 to black', () => {
    const { r, g, b } = oklchToSrgb({ l: 0, c: 0, h: 0, alpha: 1 })
    expect(r).toBeCloseTo(0, 2)
    expect(g).toBeCloseTo(0, 2)
    expect(b).toBeCloseTo(0, 2)
  })

  it('maps the oklch coordinates of sRGB red back to red', () => {
    const { r, g, b } = oklchToSrgb({
      l: 0.62796,
      c: 0.25768,
      h: 29.234,
      alpha: 1
    })
    expect(r).toBeCloseTo(1, 2)
    expect(g).toBeCloseTo(0, 2)
    expect(b).toBeCloseTo(0, 2)
  })
})

describe('contrastRatio', () => {
  const white = { l: 1, c: 0, h: 0, alpha: 1 }
  const black = { l: 0, c: 0, h: 0, alpha: 1 }

  it('gives 21:1 for black on white', () => {
    expect(contrastRatio(black, white)).toBeCloseTo(21, 1)
  })

  it('is symmetric', () => {
    expect(contrastRatio(white, black)).toBeCloseTo(21, 1)
  })

  it('gives 1:1 for a color against itself', () => {
    expect(contrastRatio(white, white)).toBeCloseTo(1, 5)
  })

  it('composites a translucent foreground over its background', () => {
    const halfBlack = { l: 0, c: 0, h: 0, alpha: 0.5 }
    const opaque = contrastRatio(black, white)
    const translucent = contrastRatio(halfBlack, white)
    expect(translucent).toBeLessThan(opaque)
    expect(translucent).toBeGreaterThan(1)
  })
})

describe('isInGamut', () => {
  it('accepts a color sRGB can show', () => {
    expect(isInGamut({ l: 0.575, c: 0.235, h: 28, alpha: 1 })).toBe(true)
  })

  it('rejects a chroma beyond the sRGB gamut', () => {
    expect(isInGamut({ l: 0.575, c: 0.3, h: 28, alpha: 1 })).toBe(false)
  })

  it('rejects two distinct out-of-gamut reds that clamp to one pixel', () => {
    // The palette's previous --primary and --destructive: different in OKLCH,
    // both outside sRGB, and both painted rgb(230, 0, 0) by Chromium.
    const primary = { l: 0.57, c: 0.25, h: 28, alpha: 1 }
    const destructive = { l: 0.55, c: 0.27, h: 25, alpha: 1 }
    const paint = (color: typeof primary) => {
      const { r, g, b } = oklchToSrgb(color)
      return [r, g, b].map((channel) => Math.round(channel * 255))
    }

    expect(isInGamut(primary)).toBe(false)
    expect(isInGamut(destructive)).toBe(false)
    expect(paint(primary)).toEqual(paint(destructive))
  })
})

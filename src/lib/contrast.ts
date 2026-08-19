/**
 * WCAG contrast maths for the `oklch(...)` design tokens in `globals.css`.
 *
 * Colors are declared in OKLCH, but WCAG 2.x defines contrast over sRGB
 * relative luminance — so every check has to travel OKLCH → OKLab → linear
 * sRGB → gamma-encoded sRGB (clamped, the way a browser renders an
 * out-of-gamut color) → luminance.
 */

export type Oklch = {
  l: number
  c: number
  h: number
  /** 0–1; tokens such as `--border` are declared translucent. */
  alpha: number
}

export type Srgb = { r: number; g: number; b: number }

/** Text needs 4.5:1 against its background at AA. */
export const AA_TEXT = 4.5

/**
 * Visibility floor for purely decorative separators. WCAG exempts these from
 * 1.4.11, but a hairline that vanishes into its surface still reads as a
 * rendering bug, so hold them to something rather than to nothing.
 */
export const DECORATIVE_MIN = 1.4

const OKLCH_PATTERN =
  /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+)(%?)\s*)?\)$/

/**
 * Reads a CSS `oklch(l c h)` / `oklch(l c h / a)` value, returning null for any
 * other notation so callers can skip non-color custom properties.
 */
export function parseOklch(value: string): Oklch | null {
  const match = OKLCH_PATTERN.exec(value.trim())
  if (!match) return null

  const [, l, c, h, alpha, percent] = match
  const rawAlpha = alpha === undefined ? 1 : Number(alpha)

  return {
    l: Number(l),
    c: Number(c),
    h: Number(h),
    alpha: percent ? rawAlpha / 100 : rawAlpha
  }
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))

const gammaEncode = (channel: number) =>
  channel <= 0.0031308
    ? 12.92 * channel
    : 1.055 * Math.pow(channel, 1 / 2.4) - 0.055

const gammaDecode = (channel: number) =>
  channel <= 0.04045
    ? channel / 12.92
    : Math.pow((channel + 0.055) / 1.055, 2.4)

/** OKLCH → linear sRGB, before gamut clamping or gamma encoding. */
const linearSrgb = (l: number, c: number, h: number) => {
  const hRad = (h * Math.PI) / 180
  const a = c * Math.cos(hRad)
  const b = c * Math.sin(hRad)

  const lCone = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const mCone = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const sCone = (l - 0.0894841775 * a - 1.291485548 * b) ** 3

  return [
    4.0767416621 * lCone - 3.3077115913 * mCone + 0.2309699292 * sCone,
    -1.2684380046 * lCone + 2.6097574011 * mCone - 0.3413193965 * sCone,
    -0.0041960863 * lCone - 0.7034186147 * mCone + 1.707614701 * sCone
  ] as const
}

/**
 * Converts an OKLCH color to gamma-encoded sRGB channels in 0–1, clamping each
 * channel the way a browser does — verified against Chromium's painted pixels.
 */
export function oklchToSrgb({ l, c, h }: Oklch): Srgb {
  const [r, g, b] = linearSrgb(l, c, h)

  return {
    r: clamp01(gammaEncode(r)),
    g: clamp01(gammaEncode(g)),
    b: clamp01(gammaEncode(b))
  }
}

/**
 * Whether an OKLCH color survives the trip to sRGB untouched.
 *
 * OKLCH can name colors sRGB cannot show. Rendering clamps each channel
 * independently, which silently collapses distinct colors onto the same pixel —
 * an out-of-gamut `--primary` and `--destructive` can paint identically. The
 * contrast maths stays truthful either way (it measures the clamped result, as
 * the browser paints it), but the palette no longer says what it means.
 */
export function isInGamut({ l, c, h }: Oklch): boolean {
  return linearSrgb(l, c, h).every(
    (channel) => channel >= -1e-4 && channel <= 1 + 1e-4
  )
}

const relativeLuminance = ({ r, g, b }: Srgb) =>
  0.2126 * gammaDecode(r) + 0.7152 * gammaDecode(g) + 0.0722 * gammaDecode(b)

const compositeOver = (top: Srgb, bottom: Srgb, alpha: number): Srgb => ({
  r: top.r * alpha + bottom.r * (1 - alpha),
  g: top.g * alpha + bottom.g * (1 - alpha),
  b: top.b * alpha + bottom.b * (1 - alpha)
})

/**
 * WCAG contrast ratio between a foreground and a background, 1–21. A
 * translucent foreground is composited over the background first, matching
 * what the eye actually sees.
 */
export function contrastRatio(foreground: Oklch, background: Oklch): number {
  const backgroundRgb = oklchToSrgb(background)
  const foregroundRgb = compositeOver(
    oklchToSrgb(foreground),
    backgroundRgb,
    foreground.alpha
  )

  const lighter = Math.max(
    relativeLuminance(foregroundRgb),
    relativeLuminance(backgroundRgb)
  )
  const darker = Math.min(
    relativeLuminance(foregroundRgb),
    relativeLuminance(backgroundRgb)
  )

  return (lighter + 0.05) / (darker + 0.05)
}

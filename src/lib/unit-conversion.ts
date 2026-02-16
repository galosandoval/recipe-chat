/**
 * Canonical units: grams (weight), milliliters (volume).
 * Count units are not converted (no canonical form).
 */

export type UnitKind = 'weight' | 'volume' | 'count'

const WEIGHT_TO_GRAMS: Record<string, number> = {
  g: 1,
  gram: 1,
  grams: 1,
  kg: 1000,
  kilogram: 1000,
  kilograms: 1000,
  oz: 28.3495,
  ounce: 28.3495,
  ounces: 28.3495,
  lb: 453.592,
  lbs: 453.592,
  pound: 453.592,
  pounds: 453.592
}

const VOLUME_TO_ML: Record<string, number> = {
  ml: 1,
  milliliter: 1,
  milliliters: 1,
  l: 1000,
  liter: 1000,
  liters: 1000,
  cup: 236.588,
  cups: 236.588,
  tbsp: 14.787,
  tablespoon: 14.787,
  tablespoons: 14.787,
  tsp: 4.929,
  teaspoon: 4.929,
  teaspoons: 4.929,
  'fl oz': 29.574,
  'fluid ounce': 29.574,
  'fluid ounces': 29.574,
  pinch: 0.5,
  pinches: 0.5
}

const GRAMS_TO_UNIT: Record<string, number> = Object.fromEntries(
  Object.entries(WEIGHT_TO_GRAMS).map(([k, v]) => [k, 1 / v])
)
const ML_TO_UNIT: Record<string, number> = Object.fromEntries(
  Object.entries(VOLUME_TO_ML).map(([k, v]) => [k, 1 / v])
)

function normalizeUnit(unit: string): string {
  return unit.toLowerCase().trim()
}

export function getUnitKind(unit: string): UnitKind {
  const u = normalizeUnit(unit)
  if (u in WEIGHT_TO_GRAMS) return 'weight'
  if (u in VOLUME_TO_ML) return 'volume'
  return 'count'
}

/**
 * Convert quantity in given unit to canonical amount (grams for weight, ml for volume).
 * Count units return the same quantity (no conversion).
 */
export function toCanonical(quantity: number, unit: string): { amount: number; kind: UnitKind } {
  const u = normalizeUnit(unit)
  const weightFactor = WEIGHT_TO_GRAMS[u]
  if (weightFactor != null) {
    return { amount: quantity * weightFactor, kind: 'weight' }
  }
  const volumeFactor = VOLUME_TO_ML[u]
  if (volumeFactor != null) {
    return { amount: quantity * volumeFactor, kind: 'volume' }
  }
  return { amount: quantity, kind: 'count' }
}

/**
 * Convert from canonical amount to the target unit.
 * For count, amount is returned as-is if targetUnit is empty or unknown.
 */
export function fromCanonical(
  amount: number,
  targetUnit: string,
  kind: UnitKind
): number {
  const u = normalizeUnit(targetUnit)
  if (kind === 'weight') {
    const factor = GRAMS_TO_UNIT[u]
    if (factor != null) return amount * factor
  }
  if (kind === 'volume') {
    const factor = ML_TO_UNIT[u]
    if (factor != null) return amount * factor
  }
  return amount
}

/**
 * Subtract `subQuantity` in `subUnit` from `quantity` in `unit`.
 * Units must be same kind (weight/volume); otherwise returns null.
 * For count, subtraction is numeric only (no conversion).
 */
export function subtractQuantities(
  quantity: number,
  unit: string,
  subQuantity: number,
  subUnit: string
): { quantity: number; unit: string } | null {
  const kind = getUnitKind(unit)
  const subKind = getUnitKind(subUnit)
  if (kind !== subKind) return null
  if (kind === 'count') {
    const result = quantity - subQuantity
    return result < 0 ? null : { quantity: result, unit }
  }
  const { amount } = toCanonical(quantity, unit)
  const { amount: subAmount } = toCanonical(subQuantity, subUnit)
  const remaining = amount - subAmount
  if (remaining <= 0) return null
  const resultQty = fromCanonical(remaining, unit, kind)
  return { quantity: Math.round(resultQty * 1000) / 1000, unit }
}

/** Weight units suitable for user preference (display). */
export const PREFERRED_WEIGHT_OPTIONS = ['g', 'oz'] as const

/** Volume units suitable for user preference (display). */
export const PREFERRED_VOLUME_OPTIONS = ['ml', 'cup'] as const

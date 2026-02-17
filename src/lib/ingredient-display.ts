import type { IngredientUnitType } from '@prisma/client'
import {
  type UnitKind,
  getUnitKind,
  toCanonical,
  fromCanonical
} from '~/lib/unit-conversion'

/**
 * Shape accepted for display (Prisma Ingredient or DTO with optional structured fields).
 */
export type IngredientDisplaySource = {
  rawString?: string | null
  quantity?: number | null
  unit?: string | null
  itemName?: string | null
  preparation?: string | null
}

export type IngredientDisplaySourceWithUnitType = IngredientDisplaySource & {
  unitType?: IngredientUnitType | null
}

/**
 * Returns the best display string for an ingredient: rawString when present,
 * otherwise formatted from structured fields, otherwise empty string.
 */
export function getIngredientDisplayText(ing: IngredientDisplaySource): string {
  if (ing.rawString?.trim()) return ing.rawString.trim()
  const qty = ing.quantity
  const unit = ing.unit?.trim()
  const item = ing.itemName?.trim()
  const prep = ing.preparation?.trim()
  if (item) {
    const parts: string[] = []
    if (qty != null) parts.push(String(qty))
    if (unit) parts.push(unit)
    parts.push(item)
    if (prep) parts.push(`(${prep})`)
    return parts.join(' ')
  }
  return ''
}

/**
 * Like getIngredientDisplayText but converts quantity to user's preferred weight/volume unit when set.
 */
export function getIngredientDisplayTextInPreferredUnits(
  ing: IngredientDisplaySourceWithUnitType,
  preferredWeightUnit: string | null | undefined,
  preferredVolumeUnit: string | null | undefined
): string {
  const qty = ing.quantity
  const unit = ing.unit?.trim()
  const item = ing.itemName?.trim()
  const prep = ing.preparation?.trim()
  if (qty == null || !unit || !item) return getIngredientDisplayText(ing)

  const kind: UnitKind =
    ing.unitType === 'weight'
      ? 'weight'
      : ing.unitType === 'volume'
        ? 'volume'
        : getUnitKind(unit)

  if (kind === 'weight' && preferredWeightUnit) {
    const { amount } = toCanonical(qty, unit)
    const converted = fromCanonical(amount, preferredWeightUnit, 'weight')
    const rounded =
      converted >= 1
        ? Math.round(converted * 100) / 100
        : Math.round(converted * 1000) / 1000
    const parts = [String(rounded), preferredWeightUnit, item]
    if (prep) parts.push(`(${prep})`)
    return parts.join(' ')
  }
  if (kind === 'volume' && preferredVolumeUnit) {
    const { amount } = toCanonical(qty, unit)
    const converted = fromCanonical(amount, preferredVolumeUnit, 'volume')
    const rounded =
      converted >= 1
        ? Math.round(converted * 100) / 100
        : Math.round(converted * 1000) / 1000
    const parts = [String(rounded), preferredVolumeUnit, item]
    if (prep) parts.push(`(${prep})`)
    return parts.join(' ')
  }
  return getIngredientDisplayText(ing)
}

export type DisplayQuantityAndUnit = {
  displayQuantity: number
  displayUnit: string
  unitType: UnitKind
}

/**
 * Returns display quantity, unit, and kind for an ingredient (using preferred units when set).
 * Use for inline quantity controls. Returns null when ingredient has no quantity/unit.
 */
export function getIngredientDisplayQuantityAndUnit(
  ing: IngredientDisplaySourceWithUnitType,
  preferredWeightUnit: string | null | undefined,
  preferredVolumeUnit: string | null | undefined
): DisplayQuantityAndUnit | null {
  const qty = ing.quantity
  const unit = ing.unit?.trim()
  if (qty == null || !unit) return null

  const kind: UnitKind =
    ing.unitType === 'weight'
      ? 'weight'
      : ing.unitType === 'volume'
        ? 'volume'
        : getUnitKind(unit)

  if (kind === 'weight' && preferredWeightUnit) {
    const { amount } = toCanonical(qty, unit)
    const converted = fromCanonical(amount, preferredWeightUnit, 'weight')
    const rounded =
      converted >= 1
        ? Math.round(converted * 100) / 100
        : Math.round(converted * 1000) / 1000
    return {
      displayQuantity: rounded,
      displayUnit: preferredWeightUnit,
      unitType: 'weight'
    }
  }
  if (kind === 'volume' && preferredVolumeUnit) {
    const { amount } = toCanonical(qty, unit)
    const converted = fromCanonical(amount, preferredVolumeUnit, 'volume')
    const rounded =
      converted >= 1
        ? Math.round(converted * 100) / 100
        : Math.round(converted * 1000) / 1000
    return {
      displayQuantity: rounded,
      displayUnit: preferredVolumeUnit,
      unitType: 'volume'
    }
  }
  return {
    displayQuantity: qty,
    displayUnit: unit,
    unitType: kind
  }
}

export type AggregatedIngredient = {
  displayText: string
  ingredientIds: string[]
  checked: boolean
}

type IngredientForAggregation = IngredientDisplaySource & {
  id: string
  checked?: boolean
}

/**
 * Groups ingredients by (itemName, unit) and sums quantity for aggregation.
 * Ingredients without itemName/unit are kept as single-item groups.
 */
export function aggregateIngredients(
  ingredients: IngredientForAggregation[]
): AggregatedIngredient[] {
  const byKey = new Map<
    string,
    {
      quantity: number
      ids: string[]
      checked: boolean[]
      ing: IngredientForAggregation
    }
  >()
  for (const ing of ingredients) {
    const item = ing.itemName?.trim()
    const unit = ing.unit?.trim()
    const qty = ing.quantity
    const canMerge = item && unit && qty != null
    const key = canMerge ? `${item}|${unit}` : `__single__${ing.id}`
    const existing = byKey.get(key)
    if (existing) {
      existing.quantity += qty ?? 0
      existing.ids.push(ing.id)
      existing.checked.push(ing.checked ?? false)
    } else {
      byKey.set(key, {
        quantity: qty ?? 0,
        ids: [ing.id],
        checked: [ing.checked ?? false],
        ing
      })
    }
  }
  return Array.from(byKey.values()).map((v) => ({
    displayText:
      v.ing.itemName && v.ing.unit && v.quantity > 0
        ? [v.quantity, v.ing.unit, v.ing.itemName]
            .filter(Boolean)
            .join(' ')
        : getIngredientDisplayText(v.ing),
    ingredientIds: v.ids,
    checked: v.checked.every(Boolean)
  }))
}

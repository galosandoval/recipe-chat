import type { IngredientUnitType } from '@prisma/client'
import {
  type UnitKind,
  getUnitKind,
  toCanonical,
  fromCanonical
} from '~/lib/unit-conversion'

/**
 * Phrases that mark an ingredient as unmeasured — "to taste", garnishes,
 * optional, and serving-only items. These are never quantity-summed so the
 * shopping list keeps them as a single advisory line rather than inventing a
 * nonsensical total (e.g. "3 to taste salt").
 */
const UNMEASURED_PATTERN =
  /\b(to taste|optional|for garnish|as garnish|as needed|as required|as desired|for serving|to serve|for dusting|for sprinkling|for drizzling)\b/i

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
  /** Distinct recipe ids that contributed to this line, in first-seen order. */
  recipeIds: string[]
  checked: boolean
  /** Merged total in {@link unit}; null for unmeasured (to taste/optional) lines. */
  quantity: number | null
  /** Display unit for {@link quantity}; null when unmeasured. */
  unit: string | null
  itemName: string | null
  /** True for "to taste"/optional/garnish lines that are never quantity-summed. */
  unmeasured: boolean
}

type IngredientForAggregation = IngredientDisplaySourceWithUnitType & {
  id: string
  checked?: boolean
  recipeId?: string | null
}

/**
 * True when an ingredient should not be quantity-summed: it carries an
 * unmeasured phrase ("to taste", "optional", garnish, serving-only) or lacks a
 * usable quantity/unit pair.
 */
function isUnmeasuredIngredient(ing: IngredientForAggregation): boolean {
  const haystack = `${ing.rawString ?? ''} ${ing.preparation ?? ''} ${ing.itemName ?? ''}`
  if (UNMEASURED_PATTERN.test(haystack)) return true
  return ing.quantity == null || !ing.unit?.trim()
}

type AggregationGroup = {
  /** Sum of canonical amounts (grams/ml for weight/volume, raw qty for count). */
  canonical: number
  ids: string[]
  recipeIds: string[]
  checked: boolean[]
  ing: IngredientForAggregation
  kind: UnitKind
  unmeasured: boolean
}

/**
 * Computes the grouping key for an ingredient. Measured weight/volume items
 * merge across compatible units of the same kind (so cups + tablespoons
 * combine); count units only merge when the unit string matches; unmeasured
 * items merge by item name; the rest stay individual.
 */
function aggregationKey(
  ing: IngredientForAggregation,
  unmeasured: boolean,
  kind: UnitKind
): string {
  const item = ing.itemName?.trim().toLowerCase()
  if (unmeasured) {
    return item ? `__unmeasured__${item}` : `__single__${ing.id}`
  }
  if (!item) return `__single__${ing.id}`
  if (kind === 'count') {
    return `${item}|count|${ing.unit?.trim().toLowerCase()}`
  }
  return `${item}|${kind}`
}

function roundQuantity(value: number): number {
  return value >= 1
    ? Math.round(value * 100) / 100
    : Math.round(value * 1000) / 1000
}

/**
 * Groups shopping-list ingredients into merged lines: same item with compatible
 * units are summed (converting between units of the same kind where needed),
 * recipe sources are tracked, and unmeasured items ("to taste", optional,
 * garnish) are kept as advisory lines that are never summed.
 */
export function aggregateIngredients(
  ingredients: IngredientForAggregation[],
  preferredWeightUnit?: string | null,
  preferredVolumeUnit?: string | null
): AggregatedIngredient[] {
  const byKey = new Map<string, AggregationGroup>()

  for (const ing of ingredients) {
    const unmeasured = isUnmeasuredIngredient(ing)
    const unit = ing.unit?.trim()
    const kind: UnitKind =
      ing.unitType === 'weight'
        ? 'weight'
        : ing.unitType === 'volume'
          ? 'volume'
          : unit
            ? getUnitKind(unit)
            : 'count'
    const key = aggregationKey(ing, unmeasured, kind)
    const canonical =
      !unmeasured && unit && ing.quantity != null
        ? toCanonical(ing.quantity, unit).amount
        : 0

    const existing = byKey.get(key)
    if (existing) {
      existing.canonical += canonical
      existing.ids.push(ing.id)
      existing.checked.push(ing.checked ?? false)
      if (ing.recipeId && !existing.recipeIds.includes(ing.recipeId)) {
        existing.recipeIds.push(ing.recipeId)
      }
    } else {
      byKey.set(key, {
        canonical,
        ids: [ing.id],
        recipeIds: ing.recipeId ? [ing.recipeId] : [],
        checked: [ing.checked ?? false],
        ing,
        kind,
        unmeasured
      })
    }
  }

  return Array.from(byKey.values()).map((group) =>
    buildAggregatedIngredient(group, preferredWeightUnit, preferredVolumeUnit)
  )
}

function buildAggregatedIngredient(
  group: AggregationGroup,
  preferredWeightUnit?: string | null,
  preferredVolumeUnit?: string | null
): AggregatedIngredient {
  const base = {
    ingredientIds: group.ids,
    recipeIds: group.recipeIds,
    checked: group.checked.every(Boolean)
  }

  if (group.unmeasured) {
    return {
      ...base,
      displayText: getIngredientDisplayText(group.ing),
      quantity: null,
      unit: null,
      itemName: group.ing.itemName?.trim() ?? null,
      unmeasured: true
    }
  }

  const preferred =
    group.kind === 'weight'
      ? preferredWeightUnit
      : group.kind === 'volume'
        ? preferredVolumeUnit
        : null
  const displayUnit = preferred?.trim() || (group.ing.unit?.trim() ?? '')
  const quantity = roundQuantity(
    fromCanonical(group.canonical, displayUnit, group.kind)
  )
  const itemName = group.ing.itemName?.trim() ?? null
  const displayText =
    [quantity, displayUnit, itemName].filter(Boolean).join(' ') ||
    getIngredientDisplayText(group.ing)

  return {
    ...base,
    displayText,
    quantity,
    unit: displayUnit || null,
    itemName,
    unmeasured: false
  }
}

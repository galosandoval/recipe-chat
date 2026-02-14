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

import type { ReactNode } from 'react'
import { Badge } from '~/components/ui/badge'
import type {
  DisplayQuantityAndUnit,
  IngredientDisplaySourceWithUnitType
} from '~/lib/ingredient-display'
import {
  getIngredientDisplayQuantityAndUnit,
  getIngredientDisplayText,
  getIngredientDisplayTextInPreferredUnits
} from '~/lib/ingredient-display'

/**
 * Shared ingredient display used by List and Pantry pages.
 * Shows quantity + unit badge + item name when structured data is available,
 * otherwise falls back to plain text.
 *
 * Pass `quantitySlot` to replace the default static quantity with custom controls
 * (e.g. pantry's +/- buttons).
 */
export function IngredientItemDisplay({
  ingredient,
  preferredWeightUnit,
  preferredVolumeUnit,
  quantitySlot
}: {
  ingredient: IngredientDisplaySourceWithUnitType
  preferredWeightUnit?: string | null
  preferredVolumeUnit?: string | null
  quantitySlot?: ReactNode
}) {
  const display = getIngredientDisplayQuantityAndUnit(
    ingredient,
    preferredWeightUnit,
    preferredVolumeUnit
  )

  if (!display) {
    const text =
      getIngredientDisplayTextInPreferredUnits(
        ingredient,
        preferredWeightUnit,
        preferredVolumeUnit
      ) || getIngredientDisplayText(ingredient)
    return <span>{text}</span>
  }

  const itemName = ingredient.itemName?.trim() || ''
  const preparation = ingredient.preparation?.trim()

  return (
    <span className='inline-flex flex-wrap items-center gap-1.5'>
      {quantitySlot ?? (
        <span className='font-medium'>{display.displayQuantity}</span>
      )}
      <UnitBadge unit={display.displayUnit} />
      <span>
        {itemName}
        {preparation ? ` (${preparation})` : ''}
      </span>
    </span>
  )
}

export function UnitBadge({
  unit,
  className
}: {
  unit: string
  className?: string
}) {
  return (
    <Badge
      variant='outline'
      className={className ?? 'shrink-0 px-1.5 py-0 text-xs'}
    >
      {unit}
    </Badge>
  )
}

/**
 * Hook that returns display helpers for an ingredient.
 * Used by both List and Pantry to compute display data consistently.
 */
export function getIngredientItemDisplay(
  ingredient: IngredientDisplaySourceWithUnitType,
  preferredWeightUnit?: string | null,
  preferredVolumeUnit?: string | null
): {
  display: DisplayQuantityAndUnit | null
  displayText: string
  itemName: string
} {
  const display = getIngredientDisplayQuantityAndUnit(
    ingredient,
    preferredWeightUnit,
    preferredVolumeUnit
  )
  const displayText =
    getIngredientDisplayTextInPreferredUnits(
      ingredient,
      preferredWeightUnit,
      preferredVolumeUnit
    ) || getIngredientDisplayText(ingredient)
  const itemName = ingredient.itemName?.trim() || displayText

  return { display, displayText, itemName }
}

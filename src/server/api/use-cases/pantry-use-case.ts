import { type PrismaClient } from '@prisma/client'
import { PantryAccess } from '~/server/api/data-access/pantry-access'
import { cuid } from '~/lib/createId'
import { ingredientStringToCreatePayload } from '~/lib/parse-ingredient'
import { toCanonical, fromCanonical } from '~/lib/unit-conversion'
import { roundQuantity } from '~/lib/ingredient-display'

export async function getPantryByUserId(userId: string, prisma?: PrismaClient) {
  const pantryAccess = new PantryAccess(prisma)
  return pantryAccess.getPantryByUserId(userId)
}

export async function addIngredientToPantry(
  userId: string,
  rawLine: string,
  newIngredientId: string,
  prisma: PrismaClient
) {
  const pantryAccess = new PantryAccess(prisma)
  const parsed = ingredientStringToCreatePayload(rawLine.trim())
  const pantry = await pantryAccess.getOrCreatePantry(userId)
  return pantryAccess.createPantryIngredient({
    id: newIngredientId,
    pantryId: pantry.id,
    rawString: parsed.rawString || rawLine.trim(),
    quantity: parsed.quantity,
    unit: parsed.unit,
    unitType: parsed.unitType,
    itemName: parsed.itemName,
    preparation: parsed.preparation
  })
}

export async function updatePantryIngredient(
  ingredientId: string,
  data: {
    rawString?: string
    quantity?: number | null
    unit?: string | null
    unitType?: 'volume' | 'weight' | 'count' | null
    itemName?: string | null
    preparation?: string | null
  },
  prisma: PrismaClient
) {
  const pantryAccess = new PantryAccess(prisma)
  let updateData = { ...data }
  if (data.rawString !== undefined && data.rawString.trim() !== '') {
    const parsed = ingredientStringToCreatePayload(data.rawString.trim())
    updateData = {
      ...updateData,
      rawString: parsed.rawString ?? data.rawString.trim(),
      quantity: parsed.quantity,
      unit: parsed.unit,
      unitType: parsed.unitType,
      itemName: parsed.itemName,
      preparation: parsed.preparation
    }
  }
  return pantryAccess.updatePantryIngredient(ingredientId, updateData)
}

type PantryUpdateData = {
  rawString?: string
  quantity?: number | null
  unit?: string | null
  unitType?: 'volume' | 'weight' | 'count' | null
  itemName?: string | null
  preparation?: string | null
}

/**
 * Commits a staged pantry edit in one pass: deletes the removed ingredients,
 * then applies each row's change. A `rawString` change is re-parsed (rename
 * path); a structured change writes the fields directly and composes a fresh
 * `rawString` so list/pantry display stays in sync even without preferred units.
 */
export async function bulkUpdatePantry(
  updates: { ingredientId: string; data: PantryUpdateData }[],
  deletedIds: string[],
  prisma: PrismaClient
) {
  const pantryAccess = new PantryAccess(prisma)
  if (deletedIds.length > 0) {
    await pantryAccess.deletePantryIngredients(deletedIds)
  }
  for (const { ingredientId, data } of updates) {
    if (data.rawString !== undefined && data.rawString.trim() !== '') {
      const parsed = ingredientStringToCreatePayload(data.rawString.trim())
      await pantryAccess.updatePantryIngredient(ingredientId, {
        rawString: parsed.rawString ?? data.rawString.trim(),
        quantity: parsed.quantity,
        unit: parsed.unit,
        unitType: parsed.unitType,
        itemName: parsed.itemName,
        preparation: parsed.preparation
      })
      continue
    }
    const composed = [data.quantity, data.unit, data.itemName]
      .filter((part) => part != null && part !== '')
      .join(' ')
      .trim()
    await pantryAccess.updatePantryIngredient(ingredientId, {
      quantity: data.quantity ?? null,
      unit: data.unit ?? null,
      unitType: data.unitType ?? null,
      itemName: data.itemName ?? null,
      rawString: composed
    })
  }
}

export async function deletePantryIngredient(
  ingredientId: string,
  prisma: PrismaClient
) {
  const pantryAccess = new PantryAccess(prisma)
  await pantryAccess.deletePantryIngredients([ingredientId])
}

export async function bulkAddToPantry(
  userId: string,
  rawLines: string[],
  prisma: PrismaClient
) {
  const pantryAccess = new PantryAccess(prisma)
  const pantry = await pantryAccess.getOrCreatePantry(userId)
  const results = []
  for (const line of rawLines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    const parsed = ingredientStringToCreatePayload(trimmed)

    // Merge with an existing pantry item of the same item name and unit kind,
    // converting units so e.g. 1 tbsp merges into an existing 1 cup.
    if (parsed.itemName && parsed.unit && parsed.quantity != null) {
      const existing =
        parsed.unitType === 'weight' || parsed.unitType === 'volume'
          ? await pantryAccess.findPantryIngredientByItemAndKind(
              pantry.id,
              parsed.itemName,
              parsed.unitType
            )
          : await pantryAccess.findPantryIngredientByItemAndUnit(
              pantry.id,
              parsed.itemName,
              parsed.unit
            )
      if (existing && existing.quantity != null && existing.unit) {
        const mergedCanonical =
          toCanonical(existing.quantity, existing.unit).amount +
          toCanonical(parsed.quantity, parsed.unit).amount
        const mergedQuantity = roundQuantity(
          fromCanonical(
            mergedCanonical,
            existing.unit,
            existing.unitType ?? 'count'
          )
        )
        const merged = await pantryAccess.updatePantryIngredient(existing.id, {
          quantity: mergedQuantity,
          rawString:
            `${mergedQuantity} ${existing.unit} ${existing.itemName}`.trim()
        })
        results.push(merged)
        continue
      }
    }

    const id = cuid()
    const ing = await pantryAccess.createPantryIngredient({
      id,
      pantryId: pantry.id,
      rawString: parsed.rawString || trimmed,
      quantity: parsed.quantity,
      unit: parsed.unit,
      unitType: parsed.unitType,
      itemName: parsed.itemName,
      preparation: parsed.preparation
    })
    results.push(ing)
  }
  return results
}

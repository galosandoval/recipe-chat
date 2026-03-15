import { type PrismaClient } from '@prisma/client'
import { PantryAccess } from '~/server/api/data-access/pantry-access'
import { cuid } from '~/lib/createId'
import { ingredientStringToCreatePayload } from '~/lib/parse-ingredient'

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

    // Merge with existing pantry item if same itemName + unit
    if (parsed.itemName && parsed.unit && parsed.quantity != null) {
      const existing = await pantryAccess.findPantryIngredientByItemAndUnit(
        pantry.id,
        parsed.itemName,
        parsed.unit
      )
      if (existing && existing.quantity != null) {
        const merged = await pantryAccess.updatePantryIngredient(existing.id, {
          quantity: existing.quantity + parsed.quantity,
          rawString:
            `${existing.quantity + parsed.quantity} ${existing.unit} ${existing.itemName}`.trim()
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

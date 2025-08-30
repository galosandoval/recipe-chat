import { type PrismaClient } from '@prisma/client'
import { ListsAccess } from '~/server/api/data-access/lists-access'
import { IngredientsAccess } from '~/server/api/data-access/ingredients-access'

interface IngredientInput {
  id: string
  recipeId?: string | null
}

export async function upsertList(
  userId: string,
  ingredientIds: string[],
  prisma: PrismaClient
) {
  const listDataAccess = new ListsAccess(prisma)
  return listDataAccess.upsertList(userId, ingredientIds)
}

export async function getListByUserId(userId: string, prisma: PrismaClient) {
  const listDataAccess = new ListsAccess(prisma)
  return listDataAccess.getListByUserId(userId)
}

export async function addIngredientToList(
  userId: string,
  newIngredientName: string,
  newIngredientId: string,
  prisma: PrismaClient
) {
  return prisma.$transaction(async (tx) => {
    const ingredientsDataAccess = new IngredientsAccess(tx as PrismaClient)
    const listDataAccess = new ListsAccess(tx as PrismaClient)

    const newIngredient = await ingredientsDataAccess.createIngredient({
      name: newIngredientName,
      id: newIngredientId,
      checked: false,
      listId: null,
      recipeId: null
    })

    return listDataAccess.updateList(userId, {
      ingredients: { connect: [{ id: newIngredient.id }] }
    })
  })
}

export async function updateIngredientCheckStatus(
  ingredientId: string,
  checked: boolean,
  prisma: PrismaClient
) {
  return prisma.ingredient.update({
    where: { id: ingredientId },
    data: { checked }
  })
}

export async function updateManyIngredientsCheckStatus(
  ingredients: { id: string; checked: boolean }[],
  prisma: PrismaClient
) {
  return prisma.$transaction(
    ingredients.map(({ id, checked }) =>
      prisma.ingredient.update({
        where: { id },
        data: { checked }
      })
    )
  )
}

export async function clearCheckedIngredientsFromList(
  ingredients: IngredientInput[],
  userId: string,
  prisma: PrismaClient
) {
  return prisma.$transaction(async (tx) => {
    const listDataAccess = new ListsAccess(tx as PrismaClient)

    const toDisconnect: IngredientInput[] = []
    const toDelete: IngredientInput[] = []

    for (const ingredient of ingredients) {
      if (ingredient.recipeId) {
        toDisconnect.push(ingredient)
      } else {
        toDelete.push(ingredient)
      }
    }

    if (toDisconnect.length) {
      await listDataAccess.updateList(userId, {
        ingredients: { disconnect: toDisconnect.map(({ id }) => ({ id })) }
      })
    }

    if (toDelete.length) {
      await listDataAccess.deleteIngredients(toDelete.map(({ id }) => id))
    }
  })
}

import { type Recipe, type PrismaClient } from '@prisma/client'
import { RecipesAccess } from '../data-access/recipes-access'
import type { CreateRecipe, UpdateRecipe } from '~/schemas/recipes-schema'
import { ingredientStringToCreatePayload } from '~/lib/parse-ingredient'
import { getIngredientDisplayText } from '~/lib/ingredient-display'
import { embedRecipeById } from './embed-recipe-use-case'

export async function createRecipeWithEmbedding(
  recipe: Omit<CreateRecipe, 'messsageId'>,
  userId: string,
  prisma: PrismaClient
) {
  const recipesAccess = new RecipesAccess(prisma)
  const created = await recipesAccess.createRecipe(recipe, userId)

  await embedRecipeById(created.id, userId, prisma)

  return created
}

export async function getRecipeNamesByUserId(
  userId: string,
  prisma?: PrismaClient
) {
  const access = new RecipesAccess(prisma)
  return await access.getRecipeNamesByUserId(userId)
}

// Recipe fields that feed the embedding signature. Editing any of these makes
// the stored vector stale, so the recipe must be re-embedded.
const SEMANTIC_FIELDS = new Set<keyof Recipe>([
  'name',
  'description',
  'cuisine',
  'course',
  'dietTags',
  'flavorTags',
  'mainIngredients',
  'techniques'
])

export async function editRecipe(
  recipe: UpdateRecipe,
  userId: string,
  prisma: PrismaClient
) {
  const { id, ingredients, newIngredients, instructions, newInstructions } =
    recipe
  const { slug, changedFields } = await prisma.$transaction(async (tx) => {
    const recipesDataAccess = new RecipesAccess(tx as PrismaClient)
    const changedFields = await updateRecipeFields(id, recipe, recipesDataAccess)
    await handleIngredients(id, ingredients, newIngredients, recipesDataAccess)
    await handleInstructions(
      id,
      instructions,
      newInstructions,
      recipesDataAccess
    )
    const foundRecipe = await recipesDataAccess.getRecipeById(id)
    if (!foundRecipe) {
      throw new Error('Recipe not found')
    }
    return { slug: foundRecipe.slug, changedFields }
  })

  // Refresh the embedding only when a semantic field actually changed, so a
  // notes/timing-only edit doesn't pay for a needless re-embed. Runs outside the
  // transaction (external call) and is non-blocking.
  if (changedFields.some((field) => SEMANTIC_FIELDS.has(field))) {
    await embedRecipeById(id, userId, prisma)
  }

  return slug
}

// Helper functions
function arraysEqual(
  a: string[],
  b: string[] | null | undefined
): boolean {
  if (!b || a.length !== b.length) {
    return false
  }
  return a.every((value, i) => value === b[i])
}

// Edits are a selective field-diff (only changed `new*` fields are written and
// reported as changed for the re-embed check), so this path intentionally does NOT
// go through `toRecipeWriteData` — which builds a full write payload. A new facet
// must therefore be added here too, in addition to the shared mapper.
async function updateRecipeFields(
  id: string,
  recipe: UpdateRecipe,
  recipesDataAccess: RecipesAccess
): Promise<Array<keyof Recipe>> {
  const data = {} as Partial<Recipe>
  const {
    newPrepMinutes,
    prepMinutes,
    newCookMinutes,
    cookMinutes,
    newDescription,
    description,
    newName,
    name,
    newNotes,
    notes,
    newCuisine,
    cuisine,
    newCourse,
    course,
    newDietTags,
    dietTags,
    newFlavorTags,
    flavorTags,
    newMainIngredients,
    mainIngredients,
    newTechniques,
    techniques
  } = recipe

  if (newPrepMinutes && newPrepMinutes !== prepMinutes) {
    data.prepMinutes = newPrepMinutes
  }
  if (newCookMinutes && newCookMinutes !== cookMinutes) {
    data.cookMinutes = newCookMinutes
  }
  if (newDescription && newDescription !== description) {
    data.description = newDescription
  }
  if (newName && newName !== name) {
    data.name = newName
  }
  if (newNotes && newNotes !== notes) {
    data.notes = newNotes
  }
  if (newCuisine && newCuisine !== cuisine) {
    data.cuisine = newCuisine
  }
  if (newCourse && newCourse !== course) {
    data.course = newCourse
  }
  if (newDietTags && !arraysEqual(newDietTags, dietTags)) {
    data.dietTags = newDietTags
  }
  if (newFlavorTags && !arraysEqual(newFlavorTags, flavorTags)) {
    data.flavorTags = newFlavorTags
  }
  if (newMainIngredients && !arraysEqual(newMainIngredients, mainIngredients)) {
    data.mainIngredients = newMainIngredients
  }
  if (newTechniques && !arraysEqual(newTechniques, techniques)) {
    data.techniques = newTechniques
  }

  const changedFields = Object.keys(data) as Array<keyof Recipe>
  if (changedFields.length > 0) {
    await recipesDataAccess.updateRecipe(id, data)
  }
  return changedFields
}

async function handleIngredients(
  id: string,
  ingredients: UpdateRecipe['ingredients'],
  newIngredients: UpdateRecipe['newIngredients'],
  recipesDataAccess: RecipesAccess
) {
  const ingredientsToDelete = ingredients.filter(
    (old) => !newIngredients.some((n) => n.id === old.id)
  )
  if (ingredientsToDelete.length > 0) {
    await recipesDataAccess.deleteIngredientsByIds(
      ingredientsToDelete.map((i) => i.id)
    )
  }

  const ingredientsToCreate = newIngredients.filter((n) => n.id === '')
  if (ingredientsToCreate.length > 0) {
    await recipesDataAccess.createIngredients(
      ingredientsToCreate.map((i) => ({
        ...ingredientStringToCreatePayload(i.name),
        recipeId: id
      }))
    )
  }

  const ingredientsToUpdate = newIngredients.filter((n) =>
    ingredients.some(
      (old) => old.id === n.id && getIngredientDisplayText(old) !== n.name
    )
  )

  if (ingredientsToUpdate.length > 0) {
    await recipesDataAccess.updateIngredients(
      ingredientsToUpdate.map((i) => ({
        id: i.id,
        ...ingredientStringToCreatePayload(i.name)
      }))
    )
  }
}

async function handleInstructions(
  id: string,
  instructions: UpdateRecipe['instructions'],
  newInstructions: UpdateRecipe['newInstructions'],
  recipesDataAccess: RecipesAccess
) {
  // Delete instructions that no longer exist
  const instructionsToDelete = instructions.filter(
    (old) => !newInstructions.some((n) => n.id === old.id)
  )
  if (instructionsToDelete.length > 0) {
    await recipesDataAccess.deleteInstructionsByIds(
      instructionsToDelete.map((i) => i.id)
    )
  }

  // Create instructions that are new
  const instructionsToCreate = newInstructions.filter((n) => n.id === '')
  if (instructionsToCreate.length > 0) {
    await recipesDataAccess.createInstructions(
      instructionsToCreate.map((i) => ({
        description: i.description,
        recipeId: id
      }))
    )
  }

  // Update instructions
  const instructionsToUpdate = newInstructions.filter((n) =>
    instructions.some(
      (old) => old.id === n.id && old.description !== n.description
    )
  )

  if (instructionsToUpdate.length > 0) {
    await recipesDataAccess.updateInstructions(instructionsToUpdate)
  }
}

export async function saveRecipe(
  data: {
    id: string
  },
  recipesDataAccess: RecipesAccess
) {
  await recipesDataAccess.saveRecipe(data)
}

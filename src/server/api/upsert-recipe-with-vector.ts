import { prisma } from '~/server/db' // your Prisma client
import { buildSignature, embedSignature } from '~/utils/embeddings'
import { normalize } from '~/utils/normalize'

type UpsertArgs = {
  userId: string
  recipe: {
    id?: string // if provided, we update; else create
    name: string
    description?: string | null
    imgUrl?: string | null
    author?: string | null
    address?: string | null
    cuisine?: string | null
    course?: string | null
    dietTags?: string[]
    flavorTags?: string[]
    mainIngredients?: string[]
    techniques?: string[]
    prepTime?: string | null
    cookTime?: string | null
    prepMinutes?: number | null
    cookMinutes?: number | null
    categories?: string[]
    notes?: string | null
    saved?: boolean
    // instructions/ingredients: shape matches your existing flow
    instructions?: { description: string }[]
    ingredients?: { name: string }[]
  }
  // set to true if you want to recompute signature/vector even on update
  reembedOnUpdate?: boolean
}

export async function upsertRecipeWithVector({
  userId,
  recipe,
  reembedOnUpdate
}: UpsertArgs) {
  const nameNorm = normalize(recipe.name)

  // Create or update Recipe
  const rec = recipe.id
    ? await prisma.recipe.update({
        where: { id: recipe.id },
        data: {
          userId,
          name: recipe.name,
          nameNorm,
          description: recipe.description ?? null,
          imgUrl: recipe.imgUrl ?? null,
          author: recipe.author ?? null,
          address: recipe.address ?? null,
          cuisine: recipe.cuisine ?? null,
          course: recipe.course ?? null,
          dietTags: recipe.dietTags ?? [],
          flavorTags: recipe.flavorTags ?? [],
          mainIngredients: recipe.mainIngredients ?? [],
          techniques: recipe.techniques ?? [],
          prepTime: recipe.prepTime ?? null,
          cookTime: recipe.cookTime ?? null,
          prepMinutes: recipe.prepMinutes ?? null,
          cookMinutes: recipe.cookMinutes ?? null,
          notes: recipe.notes ?? '',
          saved: recipe.saved ?? false
          // If you manage relations for instructions/ingredients, handle them elsewhere
        }
      })
    : await prisma.recipe.create({
        data: {
          userId,
          name: recipe.name,
          nameNorm,
          description: recipe.description ?? null,
          imgUrl: recipe.imgUrl ?? null,
          author: recipe.author ?? null,
          address: recipe.address ?? null,
          cuisine: recipe.cuisine ?? null,
          course: recipe.course ?? null,
          dietTags: recipe.dietTags ?? [],
          flavorTags: recipe.flavorTags ?? [],
          mainIngredients: recipe.mainIngredients ?? [],
          techniques: recipe.techniques ?? [],
          prepTime: recipe.prepTime ?? null,
          cookTime: recipe.cookTime ?? null,
          prepMinutes: recipe.prepMinutes ?? null,
          cookMinutes: recipe.cookMinutes ?? null,
          notes: recipe.notes ?? '',
          saved: recipe.saved ?? false
        }
      })

  // Build signature (only the fields that define identity)
  const signature = buildSignature({
    name: rec.name,
    description: rec.description,
    cuisine: rec.cuisine,
    course: rec.course,
    dietTags: rec.dietTags,
    flavorTags: rec.flavorTags,
    mainIngredients: rec.mainIngredients,
    techniques: rec.techniques
  })

  // Only embed if new or we explicitly want a refresh
  const needEmbedding =
    !recipe.id ||
    reembedOnUpdate ||
    !(await prisma.recipeVector.findUnique({ where: { recipeId: rec.id } }))

  if (needEmbedding) {
    const vector = await embedSignature(signature) // number[]
    const vectorLiteral = `[${vector.join(',')}]` // pgvector text literal

    // Upsert into RecipeVector
    await prisma.$executeRawUnsafe(
      `
      INSERT INTO "RecipeVector" ("recipeId", "userId", "signature", "embedding")
      VALUES ($1, $2, $3, $4::vector)
      ON CONFLICT ("recipeId") DO UPDATE
        SET "signature" = EXCLUDED."signature",
            "embedding" = EXCLUDED."embedding",
            "updatedAt" = now()
    `,
      rec.id,
      userId,
      signature,
      vectorLiteral
    )
  }

  return rec.id
}

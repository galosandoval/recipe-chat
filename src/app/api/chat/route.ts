import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { chatParams } from '~/schemas/chats-schema'
import { buildSystemPrompt } from '~/constants/chat'
import { prisma } from '~/server/db'
import { compactTitles } from '~/lib/compact-title'
import { getIngredientDisplayText } from '~/lib/ingredient-display'
import { getTools } from './tools'
import { getTasteProfile } from '~/server/api/use-cases/taste-profile-use-case'
import { RecipesAccess } from '~/server/api/data-access/recipes-access'
import { getPantryByUserId } from '~/server/api/use-cases/pantry-use-case'

/** Allow streaming responses up to 30 seconds. */
export const maxDuration = 30

export async function POST(req: Request) {
  const request = await req.json()
  const input = chatParams.parse(request)
  const { filters, messages, userId, context, usePantry, expand } = input

  let recipesNames: string[] = []
  if (userId) {
    const names = await new RecipesAccess().getRecipeNamesByUserId(userId)
    recipesNames = compactTitles(names)
  }

  let pantrySummary: string[] = []
  if (userId && usePantry) {
    const pantry = await getPantryByUserId(userId)
    if (pantry?.ingredients.length) {
      pantrySummary = pantry.ingredients.map((ing) =>
        getIngredientDisplayText(ing)
      )
    }
  }

  const tasteProfile = userId ? await getTasteProfile(userId) : null

  const system = buildSystemPrompt({
    filters,
    savedRecipes: recipesNames,
    pantrySummary,
    context,
    tasteProfile
  })

  const tools = getTools(context, prisma, userId)

  const result = streamText({
    model: openai('gpt-4o-mini'),
    messages: messages
      .filter(({ role }) => role !== 'data')
      .map(({ content, role }) => ({
        content,
        role: role as 'system' | 'user' | 'assistant'
      })),
    system,
    tools,
    // When the user clicks Generate on a prior suggestion, force the full-details
    // tool so ingredients/instructions are always produced (otherwise the model
    // re-runs generateRecipeOptions and leaves them null).
    toolChoice: expand ? { type: 'tool', toolName: 'expandRecipe' } : 'auto',
    // The options turn stops after generateRecipeOptions' execute returns — no
    // second LLM round-trip re-sending the system prompt. Recipe-detail tools
    // (editRecipe/addNote) and the forced expand turn keep their 2-step flow.
    maxSteps: context?.page === 'recipe-detail' || expand ? 2 : 1
  })

  return result.toDataStreamResponse({
    getErrorMessage: (error) => {
      console.error('[streamText error]', error)
      return 'An error occurred.'
    }
  })
}

import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { chatParams } from '~/schemas/chats-schema'
import { buildSystemPrompt } from '~/constants/chat'
import { prisma } from '~/server/db'
import { compactTitles } from '~/lib/compact-title'
import { getIngredientDisplayText } from '~/lib/ingredient-display'
import { getTools } from './tools'
import { getTasteProfile } from '~/server/api/use-cases/taste-profile-use-case'
import { getGeneratedRecipeNames } from '~/server/api/use-cases/recipes-use-case'
import { getPantryByUserId } from '~/server/api/use-cases/pantry-use-case'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  const request = await req.json()
  const input = chatParams.parse(request)
  const { filters, messages, userId, context } = input

  let recipesNames: string[] = []
  if (userId) {
    const names = await getGeneratedRecipeNames(userId)
    recipesNames = compactTitles(names)
  }

  let pantrySummary: string[] = []
  if (userId) {
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

  const tools = getTools(context, prisma)

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
    maxSteps: 2
  })

  return result.toDataStreamResponse()
}

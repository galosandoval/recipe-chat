import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { chatParams } from '~/schemas/chats-schema'
import { buildSystemPrompt } from '~/constants/chat'
import { prisma } from '~/server/db'
import { compactTitles } from '~/lib/compact-title'
import { getIngredientDisplayText } from '~/lib/ingredient-display'
import { getTools } from './tools'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  const request = await req.json()
  const input = chatParams.parse(request)
  const { filters, messages, userId, context } = input

  let recipesNames: string[] = []
  if (userId) {
    // not just saved recipes, any recipe genereated by the user
    const generatedRecipes = await prisma.recipe.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    })
    recipesNames = compactTitles(generatedRecipes.map((r) => r.name))
  }

  let pantrySummary: string[] = []
  if (userId) {
    const pantry = await prisma.pantry.findUnique({
      where: { userId },
      include: { ingredients: true }
    })
    if (pantry?.ingredients.length) {
      pantrySummary = pantry.ingredients.map((ing) =>
        getIngredientDisplayText(ing)
      )
    }
  }

  const system = buildSystemPrompt({
    filters,
    savedRecipes: recipesNames,
    pantrySummary,
    context
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

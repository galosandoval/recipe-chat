import { streamObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { chatParams, generatedMessageSchema } from '~/schemas/chats'
import { buildSystemPrompt } from '~/app/constants/chat'
import { prisma } from '~/server/db'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  const request = await req.json()
  const input = chatParams.parse(request)
  const { filters, messages, userId } = input

  const generatedRecipes = await prisma.recipe.findMany({
    where: {
      userId: userId
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 50
  })
  const system = buildSystemPrompt({ filters, savedRecipes: [] })

  const result = streamObject({
    /**
     * Calls the OpenAI GPT-4 Turbo model with validated messages and system prompt,
     * using the generatedMessageSchema for output validation.
     * The messages array is mapped to the expected CoreMessage format.
     */
    model: openai('gpt-4-turbo'),
    schema: generatedMessageSchema,
    messages: messages.map(({ content, role }) => ({
      content,
      role
    })),
    system
  })
  return result.toTextStreamResponse()
}

// Example: build a compact history string
// function compactSaved(
//   recipes: Array<{
//     name: string
//     cuisine?: string
//     tags?: string[]
//   }>
// ) {
//   // Keep it compact: "Title — cuisine; tags:a,b,c"
//   return recipes
//     .slice(0, 50) // or diversity-sampled
//     .map((r) => {
//       const t = r.tags?.slice(0, 3).join(', ') || ''
//       const c = r.cuisine ? `${r.cuisine}; ` : ''
//       return `${r.title} — ${c}${t}`
//     })
//     .join(' | ')
// }

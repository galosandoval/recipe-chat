import { streamObject, UserContent } from 'ai'
import { openai } from '@ai-sdk/openai'
import { chatParams, generatedMessageSchema } from '~/schemas/chats'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  const request = await req.json()
  const input = chatParams.parse(request)
  const { filters, messages } = input

  let system = `You are an assistant that responds with a helpful message and 0 to 5 recipes. If you do respond with more than 1 recipe only include name and description for each recipe. If you only respond with 1 recipe, include the name, description, prep time, cook time, ingredients, and instructions. Ask clarifying questions before responding with recipes if needed. Respond with a wide variety of cuisines and cultures. Don't repeat recipes in the same conversation unless the user asks for changes`
  if (filters.length) {
    const filtersMessage = ` The following filters should be applied to the recipe: ${filters.join(
      ', '
    )}.`

    system += filtersMessage
  }
  const newFile = new File([], 'test.txt', { type: 'text/plain' })

  const result = streamObject({
    /**
     * Calls the OpenAI GPT-4 Turbo model with validated messages and system prompt,
     * using the generatedMessageSchema for output validation.
     * The messages array is mapped to the expected CoreMessage format.
     */
    model: openai('gpt-4-turbo'),
    schema: generatedMessageSchema,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'file',
            data: new URL(newFile.toString()),
            mediaType: 'text/plain',
            mimeType: 'text/plain'
          }
        ]
      }
    ],
    system
  })
  return result.toTextStreamResponse()
}

import { OpenAIStream, StreamingTextResponse } from 'ai'
import {
    type ChatCompletionRequestMessage,
    Configuration,
    OpenAIApi
} from 'openai-edge'
import { z } from 'zod'

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
})
const openai = new OpenAIApi(configuration)

export const config = {
    runtime: 'edge'
}

export const messageRole = ['system', 'user', 'assistant', 'function'] as const

const chatParams = z.object({
    messages: z.array(
        z.object({
            role: z.enum(messageRole),
            content: z.string()
        })
    ),
    filters: z.array(z.string())
})

export async function POST(req: Request) {
    console.log('req', req)
    const request = await req.json()

    const input = chatParams.parse(request)

    const { filters, messages } = input

    let systemMessage = `You are a helpful assistant that only responds with recipes. Do not include any explanations, only provide a RFC8259 compliant JSON response following this format without deviation. Be sure to respond with a wide variety of cuisines and cultures.
    {
      "name": "name of recipe.",
      "description": "description of recipe.",
      "prepTime": "preparation time of recipe written in plain language.",
      "cookTime": "cook time of recipe written in plain language.",
      "categories": ["array of recipe categories."],
      "ingredients": ["array of ingredients."],
      "instructions": ["array of instructions."]
    }
    `

    if (filters.length) {
        const filtersMessage = ` The following filters should be applied to the recipe: ${filters.join(
            ', '
        )}.`

        systemMessage += filtersMessage
    }

    const params: ChatCompletionRequestMessage[] = [
        {
            role: 'system',
            content: systemMessage
        }
    ]

    params.push(...messages)

    const response = await openai.createChatCompletion({
        model: 'gpt-4o',
        stream: true,
        messages: params
    })

    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(response)
    // Respond with the stream
    return new StreamingTextResponse(stream)
}

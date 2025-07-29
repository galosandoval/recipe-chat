// import { OpenAIStream, StreamingTextResponse } from 'ai'
// import {
//   type ChatCompletionRequestMessage,
//   Configuration,
//   OpenAIApi
// } from 'openai-edge'
// import { z } from 'zod'

// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY
// })
// const openai = new OpenAIApi(configuration)

// export const config = {
//   runtime: 'edge'
// }

// const messageRole = ['system', 'user', 'assistant', 'function'] as const

// const chatParams = z.object({
//   messages: z.array(
//     z.object({
//       role: z.enum(messageRole),
//       content: z.string()
//     })
//   ),
//   filters: z.array(z.string())
// })

// export async function POST(req: Request) {
//   const request = await req.json()

//   const input = chatParams.parse(request)

//   const { filters, messages } = input

//   let systemMessage = `You are a helpful assistant that only responds with recipes. Do not include any explanations, only provide a RFC8259 compliant JSON response following this format without deviation. Be sure to respond with a wide variety of cuisines and cultures.
//       {
//         "name": "name of recipe.",
//         "description": "description of recipe.",
//         "prepTime": "preparation time of recipe written in plain language.",
//         "cookTime": "cook time of recipe written in plain language.",
//         "categories": ["array of recipe categories."],
//         "ingredients": ["array of ingredients."],
//         "instructions": ["array of instructions."]
//       }
//       `

//   if (filters.length) {
//     const filtersMessage = ` The following filters should be applied to the recipe: ${filters.join(
//       ', '
//     )}.`

//     systemMessage += filtersMessage
//   }

//   const params: ChatCompletionRequestMessage[] = [
//     {
//       role: 'system',
//       content: systemMessage
//     }
//   ]

//   params.push(...messages)

//   const response = await openai.createChatCompletion({
//     model: 'gpt-4.1',
//     stream: true,
//     messages: params
//   })

//   // Convert the response into a friendly text-stream
//   const stream = OpenAIStream(response)
//   // Respond with the stream
//   return new StreamingTextResponse(stream)
// }

import { streamObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { chatParams, generatedMessageSchema } from '~/schemas/chats'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  const request = await req.json()
  console.log('request', request)
  // const input = chatParams.parse(request)

  // const { filters, messages } = input

  let system = `You are an assistant that responds with a helpful message and 0 to 5 recipes. If you do respond with more than 1 recipe only include name and description for each recipe. If you only respond with 1 recipe, include the name, description, prep time, cook time, ingredients, and instructions. Ask clarifying questions before responding with recipes if needed. Respond with a wide variety of cuisines and cultures. Don't repeat recipes in the same conversation unless the user asks for changes`
  // if (filters.length) {
  //   const filtersMessage = ` The following filters should be applied to the recipe: ${filters.join(
  //     ', '
  //   )}.`

  //   system += filtersMessage
  // }

  const result = streamObject({
    model: openai('gpt-4-turbo'),
    schema: generatedMessageSchema,
    // messages,
    system,
    prompt: request
  })

  return result.toTextStreamResponse()
}

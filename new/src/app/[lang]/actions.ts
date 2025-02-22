'use server'

import { streamObject, Message } from 'ai'
import { openai } from '@ai-sdk/openai'
import { createStreamableValue } from 'ai/rsc'
import {
	chatParams,
	generatedRecipeSchema,
	type ChatParams
} from '~/schemas/chats'

export async function generate(input: ChatParams) {
	const { messages } = chatParams.parse(input)
	console.log('messages', messages)
	const stream = createStreamableValue()

	;(async () => {
		const { partialObjectStream } = streamObject({
			model: openai('gpt-4o'),
			system: 'You generate three notifications for a messages app.',
			messages,
			schema: generatedRecipeSchema
		})

		for await (const partialObject of partialObjectStream) {
			console.log('partialObject', partialObject)
			stream.update(partialObject)
		}

		stream.done()
	})()

	return { object: stream.value }
}

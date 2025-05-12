'use server'

import { streamObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { createStreamableValue } from 'ai/rsc'
import {
	chatParams,
	generatedMessageSchema,
	type ChatParams
} from '~/schemas/chats'
import { signIn } from '~/server/auth'

export async function generate(input: ChatParams) {
	const { filters, messages } = chatParams.parse(input)

	let system = `You are an assistant that responds with a helpful message and 0 to 5 recipes. If you do respond with more than 1 recipe only include name and description. Ask clarifying questions before responding with recipes if needed. Respond with a wide variety of cuisines and cultures. Don't repeat recipes in the same conversation unless the user asks for changes`
	if (filters.length) {
		const filtersMessage = ` The following filters should be applied to the recipe: ${filters.join(
			', '
		)}.`

		system += filtersMessage
	}
	const stream = createStreamableValue()

	void (async () => {
		const { partialObjectStream } = streamObject({
			model: openai('gpt-4-turbo'),
			system,
			messages,
			schema: generatedMessageSchema
		})

		for await (const partialObject of partialObjectStream) {
			console.clear()
			console.log('partialObject', partialObject)
			stream.update(partialObject)
		}

		stream.done()
	})()

	return { object: stream.value }
}

interface SignInParams<T = 'credentials' | 'google'> {
	provider: T
	params?: T extends 'google' ? undefined : CredentialsParams
}

interface CredentialsParams {
	email: string
	password: string
	redirect: boolean
}

export async function handleSignIn({ provider, params }: SignInParams) {
	if (provider === 'credentials' && params) {
		const response = (await signIn('credentials', {
			redirect: params.redirect,
			email: params.email,
			password: params.password
		})) as Response

		return response
	}

	if (provider === 'google') {
		return await signIn('google')
	}
}

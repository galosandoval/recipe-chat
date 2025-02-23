'use client'

import useChatStore from '~/hooks/use-chat-store'
import { useTranslations } from '~/hooks/use-translations'
import { generate } from '../actions'
import { readStreamableValue } from 'ai/rsc'
import toast from 'react-hot-toast'
import { createSlug } from '~/utils/create-id'

export type ChatFormValues = {
	prompt: string
}

export const useChatForm = () => {
	const t = useTranslations()
	const {
		isStreaming,
		messages,
		streamReply,
		startStreaming,
		endStreaming,
		setIsStreaming
	} = useChatStore((state) => state)

	const onSubmit = async (data: ChatFormValues) => {
		const newMessages = [
			...messages,
			{
				role: 'user' as const,
				content: data.prompt,
				id: createSlug()
			}
		]
		startStreaming(newMessages)
		try {
			const { object } = await generate({
				filters: [],
				messages: newMessages
			})
			let partialResponse
			for await (const partialObject of readStreamableValue(object)) {
				if (partialObject) {
					streamReply(partialObject)
					partialResponse = partialObject
				}
			}
			endStreaming([
				...newMessages,
				{
					role: 'assistant',
					content: partialResponse.message,
					// length of openai message ids
					id: createSlug(),
					recipes: partialResponse.recipes
				}
			])
		} catch (error) {
			console.error('error', error)
			toast.error(t.error.somethingWentWrong)
		} finally {
			setIsStreaming(false)
		}
	}

	return { onSubmit, isStreaming }
}

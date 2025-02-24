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
		streaming,
		startedStreaming,
		streamingStopped,
		endedStreaming
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
		startedStreaming(newMessages)
		try {
			const { object } = await generate({
				filters: [],
				messages: newMessages
			})
			let partialResponse
			for await (const partialObject of readStreamableValue(object)) {
				if (partialObject) {
					streaming(partialObject)
					partialResponse = partialObject
				}
			}
			endedStreaming([
				...newMessages,
				{
					role: 'assistant',
					content: partialResponse?.message ?? '',
					id: createSlug(),
					recipes: partialResponse?.recipes ?? []
				}
			])
		} catch (error) {
			console.error('error', error)
			toast.error(t.error.somethingWentWrong)
		} finally {
			streamingStopped()
		}
	}

	return { onSubmit, isStreaming, streamingStopped }
}

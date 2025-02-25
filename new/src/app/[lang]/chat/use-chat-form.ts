'use client'

import { experimental_useObject as useObject } from '@ai-sdk/react'
import useChatStore from '~/hooks/use-chat-store'
import { useTranslations } from '~/hooks/use-translations'
import toast from 'react-hot-toast'
import { createSlug } from '~/utils/create-id'
import { generatedRecipesSchema, type GeneratedRecipes } from '~/schemas/chats'
import { useEffect, useRef, useState } from 'react'

export type ChatFormValues = {
	prompt: string
}

export const useChatForm = () => {
	const t = useTranslations()
	const [stayOnBottom, setStayOnBottom] = useState(false)
	const bottomRef = useRef<HTMLDivElement>(null)
	const {
		isStreaming,
		messages,
		streaming,
		startedStreaming,
		streamingStopped,
		endedStreaming
	} = useChatStore((state) => state)
	const { object, stop, submit } = useObject({
		api: 'api/use-object',
		schema: generatedRecipesSchema,
		onFinish: (res) => {
			endedStreaming([
				...messages,
				{
					role: 'assistant',
					content: res?.object?.message ?? '',
					id: createSlug(),
					recipes: res?.object?.recipes
				}
			])
		},
		onError: (error) => {
			console.error('error', error)
			toast.error(t.error.somethingWentWrong)
			streamingStopped()
		}
	})

	useEffect(() => {
		if (object) {
			console.log('object', object)

			streaming(object as GeneratedRecipes)

			if (bottomRef.current) {
				bottomRef.current.scrollIntoView({ behavior: 'smooth' })
			}
		}
	}, [object, streaming])

	const onSubmit = async (data: ChatFormValues) => {
		const message = {
			role: 'user' as const,
			content: data.prompt,
			id: createSlug()
		}

		startedStreaming([...messages, message])

		// const newMessages = [
		// 	...messages,
		// 	{
		// 		role: 'user' as const,
		// 		content: data.prompt,
		// 		id: createSlug()
		// 	}
		// ]
		// startedStreaming(newMessages)
		submit({
			filters: [],
			messages: [...messages, message]
		})
	}

	return { onSubmit, isStreaming, streamingStopped, stop }
}

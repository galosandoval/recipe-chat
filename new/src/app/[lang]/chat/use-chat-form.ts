'use client'

import { experimental_useObject as useObject } from '@ai-sdk/react'
import useChatStore from '~/hooks/use-chat-store'
import { useTranslations } from '~/hooks/use-translations'
import toast from 'react-hot-toast'
import { createSlug } from '~/utils/create-id'
import { generatedRecipesSchema, type GeneratedRecipes } from '~/schemas/chats'
import { useEffect, useRef, useState } from 'react'
import { useScrollRef } from '~/hooks/use-scroll-to-bottom'
export type ChatFormValues = {
	prompt: string
}

export const useChatForm = () => {
	const t = useTranslations()
	const bottomRef = useScrollRef()
	const [lastScrollY, setLastScrollY] = useState(0)
	const {
		isStreaming,
		messages,
		isScrollingToBottom,
		streaming,
		startedStreaming,
		streamingStopped,
		endedStreaming,
		scrolledDown,
		scrolledUp
	} = useChatStore((state) => state)
	const onFinishStreaming = (res?: GeneratedRecipes) => {
		endedStreaming({
			role: 'assistant',
			content: res?.message ?? '',
			id: createSlug(),
			recipes: res?.recipes
		})
	}
	const {
		object,
		stop,
		submit: submitPrompt
	} = useObject({
		api: 'api/use-object',
		schema: generatedRecipesSchema,
		onFinish: (res) => onFinishStreaming(res?.object),
		onError: (error) => {
			console.error('error', error)
			toast.error(t.error.somethingWentWrong)
			streamingStopped()
		}
	})
	useEffect(() => {
		if (object) {
			streaming(object as GeneratedRecipes)

			if (bottomRef?.current && isScrollingToBottom) {
				bottomRef?.current.scrollIntoView({ behavior: 'smooth' })
			}
		}
	}, [object, streaming, isScrollingToBottom])
	useEffect(() => {
		if (typeof window !== 'undefined') {
			window.addEventListener('scroll', () => {
				setLastScrollY(window.scrollY)
				const current =
					window.pageYOffset || document.documentElement.scrollTop
				if (current < lastScrollY) {
					scrolledUp()
				}
			})

			window.addEventListener('scrollend', () => {
				scrolledDown()
			})
		}
	}, [])

	const onSubmit = async (data: ChatFormValues) => {
		const message = {
			role: 'user' as const,
			content: data.prompt,
			id: createSlug()
		}

		const newMessages = [...messages, message]

		startedStreaming(newMessages)
		submitPrompt({
			filters: [],
			messages: newMessages
		})
	}

	const onStopStreaming = () => {
		stop()
		streamingStopped()
	}

	return { onSubmit, isStreaming, streamingStopped, onStopStreaming }
}

'use client'

import { type Chat, type Message } from '@prisma/client'
import { useSession } from 'next-auth/react'
import { useCallback, useEffect, useState } from 'react'
import { api } from '~/trpc/react'
import { z } from 'zod'
import { useTranslations } from '~/hooks/use-translations'
import { infoToastOptions } from '~/components/toast'
import { useForm } from 'react-hook-form'
import type { ChatFormValues } from '~/app/[lang]/chat/use-chat-form'
import { toast } from 'sonner'

export type FormValues = {
	name: string
	ingredients: string
	instructions: string
	description: string
	prepTime: string
	cookTime: string
	notes: string
}

export type ChatType = ReturnType<typeof useChat>

export const useChat = () => {
	const t = useTranslations()
	const [isChatsModalOpen, setIsChatsModalOpen] = useState(false)
	const [sessionChatId, changeSessionChatId] = useSessionChatId()
	const { status: authStatus } = useSession()
	const isAuthenticated = authStatus === 'authenticated'

	const { register: registerPrompt, handleSubmit: handleSubmitPrompt } =
		useForm<ChatFormValues>({ defaultValues: { prompt: '' } })

	const [shouldFetchChat, setShouldFetchChat] = useState(true)

	const enabled = isAuthenticated && !!sessionChatId && shouldFetchChat

	const { status, fetchStatus } = api.chats.getMessagesById.useQuery(
		{ chatId: sessionChatId ?? '' },
		{ enabled }
	)

	const handleGetChatsOnSuccess = useCallback(
		(
			data: (Chat & {
				messages: Message[]
			})[]
		) => {
			if (
				typeof sessionStorage.getItem('currentChatId') !== 'string' &&
				data[0]?.id
			) {
				changeSessionChatId(data[0].id)
			}
		},
		[changeSessionChatId]
	)

	const handleChangeChat = useCallback(
		(
			chat: Chat & {
				messages: Message[]
			}
		) => {
			changeSessionChatId(chat.id)
			setShouldFetchChat(true)
			setIsChatsModalOpen(false)
		},
		[]
	)

	const handleToggleChatsModal = useCallback(() => {
		setIsChatsModalOpen((state) => !state)
	}, [])

	const handleSaveRecipe = useCallback(
		({ content }: { content: string; messageId?: string }) => {
			if (!content) return

			if (!isAuthenticated) {
				// handleOpenSignUpModal()

				toast(t.toast.signUp, infoToastOptions)
				return
			}
		},
		[isAuthenticated]
	)

	return {
		chatId: sessionChatId,
		fetchStatus,
		status,
		isChatsModalOpen,
		isAuthenticated,
		handleSaveRecipe,
		handleGetChatsOnSuccess,
		handleToggleChatsModal,
		handleChangeChat,
		registerPrompt,
		handleSubmitPrompt
	}
}

function useSessionChatId() {
	const [chatId, setChatId] = useState<string | undefined>(undefined)

	const changeChatId = (chatId: string | undefined) => {
		sessionStorage.setItem('currentChatId', JSON.stringify(chatId))
		setChatId(chatId)
	}

	useEffect(() => {
		if (
			typeof window !== undefined &&
			typeof sessionStorage?.getItem('currentChatId') === 'string'
		) {
			const currentChatId = sessionStorage.getItem('currentChatId')

			setChatId(
				currentChatId
					? (JSON.parse(currentChatId) as string)
					: undefined
			)
		}
	}, [])

	return [chatId, changeChatId] as const
}

export const errorMessage = 'Please try rephrasing your question.'

export const sendMessageFormSchema = z.object({ message: z.string().min(6) })
export type ChatRecipeParams = z.infer<typeof sendMessageFormSchema>

export function transformContentToRecipe({ content }: { content: string }) {
	return JSON.parse(content) as {
		name: string
		description: string
		prepTime: string
		cookTime: string
		categories: string[]
		instructions: string[]
		ingredients: string[]
	}
}

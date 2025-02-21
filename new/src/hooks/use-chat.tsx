'use client'

import { type Chat, type Message } from '@prisma/client'
import { useChat as useAiChat, type Message as AiMessage } from 'ai/react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { type FormEvent, useCallback, useEffect, useState, useRef } from 'react'
import { toast } from 'react-hot-toast'
import { api } from '~/trpc/react'
import { z } from 'zod'
import { useTranslations } from '~/hooks/use-translations'
import { useSignUp } from '~/components/auth-modals'
import {
	errorToastOptions,
	infoToastOptions,
	loadingToastOptions,
	successToastOptions
} from '~/components/toast'
// import { useFilters } from '~/components/recipe-filters'

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

	const [sessionChatId, changeSessionChatId] = useSessionChatId()

	const router = useRouter()
	const { status: authStatus } = useSession()
	// const filters = useFilters()

	const isAuthenticated = authStatus === 'authenticated'
	const utils = api.useUtils()

	// const filtersData = filters.data

	const filterStrings: string[] = []

	// if (filtersData) {
	//   filtersData.forEach((filter) => {
	//     if (filter.checked) filterStrings.push(filter.name)
	//   })
	// }

	const { mutate: upsertChat } = api.chats.createOrAddMessages.useMutation({
		async onSuccess(data) {
			if (data.chatId) {
				sessionStorage.setItem(
					'currentChatId',
					JSON.stringify(data.chatId)
				)
			}
			setMessages(data.messages)
		}
	})

	const {
		messages,
		input,
		handleInputChange,
		stop,
		handleSubmit: submitMessages,
		isLoading: isSendingMessage,
		setMessages,
		append
	} = useAiChat({
		onFinish(message) {
			onFinishMessage(message)
		},

		body: {
			filters: filterStrings
			// locale: router.locale
		}
	})
	const handleSubmitMessage = () => {
		let chatId = ''

		const currentChatId = sessionStorage.getItem('currentChatId')

		if (currentChatId && JSON.parse(currentChatId)) {
			chatId = JSON.parse(currentChatId)
		}

		upsertChat({
			chatId,
			messages: messagesRef.current.map((message) => ({
				content: message.content,
				role: message.role
				// id: createId()
			}))
		})
	}

	const messagesRef = useRef<AiMessage[]>([])

	useEffect(() => {
		messagesRef.current = messages
	}, [messages])

	function onFinishMessage(_: AiMessage) {
		if (!messagesRef.current?.length) {
			throw new Error('No messages')
		}

		handleSubmitMessage()
	}

	const [shouldFetchChat, setShouldFetchChat] = useState(true)

	const enabled = isAuthenticated && !!sessionChatId && shouldFetchChat

	const { status, fetchStatus } = api.chats.getMessagesById.useQuery(
		{ chatId: sessionChatId ?? '' },
		{
			enabled
			// onSuccess: (data) => {
			//     if (data) {
			//         setMessages(data.messages)
			//     }
			// },
			// keepPreviousData: true
		}
	)

	const [isChatsModalOpen, setIsChatsModalOpen] = useState(false)

	const { mutate: createRecipe, status: createRecipeStatus } =
		api.recipes.create.useMutation({
			async onSuccess(newRecipe, { messageId }) {
				await utils.recipes.invalidate()
				const messagesCopy = [...messages]

				if (messageId) {
					const messageToChange = messagesCopy.find(
						(message) => message.id === messageId
					) as Message
					if (messageToChange) {
						messageToChange.recipeId = newRecipe.id
					}
				}

				setMessages(messagesCopy)

				toast.success(t.chatWindow.saveSuccess)
			},
			onError: (error) => {
				toast.error('Error: ' + error.message)
			}
		})

	const { mutateAsync: createChatAndRecipeAsync } =
		api.users.createChatAndRecipe.useMutation({
			onError: (error) => {
				toast.error('Error: ' + error.message)
			}
		})

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

	const handleFillMessage = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()

		append({ content: e.currentTarget.innerText, role: 'user' })
	}

	const handleStartNewChat = useCallback(() => {
		stop()
		setMessages([])
		changeSessionChatId('')
	}, [])

	const handleToggleChatsModal = useCallback(() => {
		setIsChatsModalOpen((state) => !state)
	}, [])

	const handleSubmit = useCallback(
		(event: FormEvent<HTMLFormElement>) => {
			setShouldFetchChat(false)

			if (isSendingMessage) {
				stop()
			} else {
				submitMessages(event, { options: {} })
			}
		},

		[isSendingMessage, stop, submitMessages]
	)

	const {
		errors: signUpErrors,
		isLoading: isSigningUp,
		isOpen: isSignUpModalOpen,
		handleClose: handleCloseSignUpModal,
		handleOpen: handleOpenSignUpModal,
		handleSubmit: handleSubmitCreds,
		onSubmit: onSubmitCreds,
		register: registerCreds
	} = useSignUp(onSignUpSuccess)

	async function onSignUpSuccess() {
		// TODO - this is a hack to get the selected recipe to save
		const lastMessage = messages.at(-1)

		if (!lastMessage) throw new Error('No last message')

		const recipe = transformContentToRecipe({
			content: lastMessage.content
		})

		const newRecipePromise = createChatAndRecipeAsync({
			recipe,
			messages
		})
		const user = await toast.promise(
			newRecipePromise,
			{
				loading: t.loading.loggingIn,
				success: () => t.toast.loginSuccess,
				error: () => t.error.somethingWentWrong
			},
			{
				loading: loadingToastOptions,
				success: { ...successToastOptions, duration: 3000 },
				error: errorToastOptions
			}
		)

		await router.push(
			`recipes/${user.recipes[0].id}?name=${encodeURIComponent(
				user.recipes[0].name
			)}`
		)
	}

	const handleGoToRecipe = useCallback(
		async ({
			recipeId,
			recipeName
		}: {
			recipeId: string | null
			recipeName?: string
		}) => {
			if (recipeId && recipeName) {
				await router.push(
					`recipes/${recipeId}?name=${encodeURIComponent(recipeName)}`
				)
			}
		},
		[]
	)

	const handleSaveRecipe = useCallback(
		({ content, messageId }: { content: string; messageId?: string }) => {
			if (!content) return

			if (!isAuthenticated) {
				handleOpenSignUpModal()

				toast(t.toast.signUp, infoToastOptions)
				return
			}

			const recipe = transformContentToRecipe({
				content
			})

			createRecipe({
				...recipe,
				messageId
			})
		},
		[isAuthenticated]
	)

	return {
		// filters,
		chatId: sessionChatId,
		fetchStatus,
		status,
		isChatsModalOpen,
		input,
		messages,
		isSendingMessage,
		isAuthenticated,
		createRecipeStatus,
		signUpErrors,
		isSignUpModalOpen,
		isSigningUp,

		handleGoToRecipe,
		handleSaveRecipe,
		handleCloseSignUpModal,
		handleSubmitCreds,
		onSubmitCreds,
		registerCreds,
		handleGetChatsOnSuccess,
		handleInputChange: useCallback(handleInputChange, []),
		handleToggleChatsModal,
		handleChangeChat,
		handleStartNewChat,
		handleFillMessage,
		handleSubmit
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

const sendMessageFormSchema = z.object({ message: z.string().min(6) })
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

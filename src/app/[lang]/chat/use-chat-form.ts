'use client'

import { readStreamableValue } from 'ai/rsc'
import chatStore from '~/lib/chat-store'
import { useTranslations } from '~/hooks/use-translations'
import { toast } from 'sonner'
import { generatedMessageSchema, type GeneratedMessage } from '~/schemas/chats'
import { useCallback, useEffect, useRef, useMemo, useState } from 'react'
import { useScrollRef } from '~/hooks/use-scroll-to-bottom'
import { z } from 'zod'
import { useSession } from 'next-auth/react'
import { api } from '~/trpc/react'
import { type RouterOutputs } from '~/trpc/react'
import { useSessionChatId, useChatMessages } from '~/hooks/use-chat'
import { type Message as PrismaMessage } from '@prisma/client'
import { createId } from '@paralleldrive/cuid2'
import { generate } from '~/app/actions'
import { experimental_useObject as useObject } from '@ai-sdk/react'

/**
 * Form schema for chat input validation
 */
export const chatFormSchema = z.object({
	prompt: z.string().min(1)
})
export type ChatFormValues = z.infer<typeof chatFormSchema>

/**
 * Custom hook to manage chat form state, streaming responses, and scroll behavior
 *
 * Handles:
 * - Form submission and validation
 * - AI response streaming
 * - Auto-scrolling behavior with manual scroll override detection
 * - Smooth UX for chatting with AI
 */
export const useChatForm = () => {
	const t = useTranslations()
	const { data: session } = useSession()
	const [, setChatId] = useSessionChatId()
	const utils = api.useUtils()

	// State from global chat store
	const {
		isStreaming,
		isScrollingToBottom,
		chatId,
		streaming,
		startedStreaming,
		streamingStopped,
		endedStreaming,
		scrolledEnd,
		scrolledUp
	} = chatStore((state) => state)
	const messages = useChatMessages()
	useEffect(() => {
		console.log('messages', messages)
	}, [messages])
	const onCreateOrAddMessagesSuccess = useCallback(
		(response: RouterOutputs['chats']['createOrAddMessages']) => {
			if (response.chatId) {
				setChatId(response.chatId)
			}
		},
		[setChatId]
	)
	const { mutate: createOrAddMessages, variables } =
		api.chats.createOrAddMessages.useMutation({
			onSuccess: (response) => onCreateOrAddMessagesSuccess(response),
			onError: (error) => {
				console.error('error', error)
				toast.error(t.error.somethingWentWrong)
				streamingStopped()
			},
			onMutate: ({ messages }) => {
				console.log('onMutate', messages)
				// const chatId = chatStore.getState().chatId
				// if (!chatId) return

				// const old = utils.chats.get.getData({ id: chatId })
				// console.log('old', old)
				// utils.chats.get.setData({ id: chatId }, old)
			},
			onSettled: () => {
				console.log('onSettled')
				void utils.chats.get.invalidate()
			}
		})
	const bottomRef = useScrollRef() // Reference to scroll to bottom

	useEffect(() => {
		console.log('use-chat-form variables', variables)
	}, [variables])

	// Scroll tracking refs
	const lastScrollYRef = useRef(0) // Tracks last scroll position for direction detection
	const userScrolledUpRef = useRef(false) // Tracks if user has manually scrolled up
	const isManualScrollingRef = useRef(false) // Tracks active manual scrolling state
	const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null) // For debouncing scroll events

	/**
	 * Handles the end of a streaming response
	 * Creates a message from the response and adds it to the chat
	 */
	const onFinishStreaming = (res: GeneratedMessage) => {
		const message = {
			role: 'assistant' as const,
			content: res?.content ?? '',
			recipes: res?.recipes,
			id: createId()
		}
		endedStreaming()
		const old = utils.chats.get.getData({ id: chatId ?? '' })

		if (old) {
			const updatedChat = buildChatMessage({
				old,
				message,
				chatId: chatId ?? '',
				userId: old.userId
			})

			utils.chats.get.setData({ id: chatId ?? '' }, (prev) => ({
				...prev,
				...updatedChat
			}))
		}

		createOrAddMessages({
			messages: [message],
			chatId: chatStore.getState().chatId
		})
		if (isScrollingToBottom) {
			bottomRef?.current?.scrollIntoView({ behavior: 'smooth' })
		}
	}

	// AI SDK object for streaming responses
	const {
		object,
		stop,
		submit: submitPrompt
	} = useObject({
		api: 'api/use-object',
		schema: generatedMessageSchema,
		onFinish: (event: {
			object: GeneratedMessage | undefined
			error: Error | undefined
		}) => event?.object && onFinishStreaming(event?.object),
		onError: (error: Error) => {
			console.error('error', error)
			toast.error(t.error.somethingWentWrong)
			streamingStopped()
		}
	})

	/**
	 * Effect to handle scroll state override
	 * If user has scrolled up but isScrollingToBottom is true,
	 * updates the state to reflect user's manual action
	 */
	useEffect(
		function handleScrolledUp() {
			if (userScrolledUpRef.current && isScrollingToBottom) {
				scrolledUp()
			}
		},
		[isScrollingToBottom, scrolledUp]
	)

	/**
	 * Effect to handle streaming responses and auto-scrolling
	 * Updates streaming state and scrolls to bottom if enabled and no manual scrolling
	 */
	useEffect(
		function handleStreaming() {
			if (object && isStreaming) {
				streaming(object as GeneratedMessage)

				if (
					bottomRef?.current &&
					isScrollingToBottom &&
					!isManualScrollingRef.current
				) {
					bottomRef?.current.scrollIntoView({ behavior: 'smooth' })
				}
			}
		},
		[object, streaming, isScrollingToBottom, isStreaming]
	)

	/**
	 * Effect to handle chat window scrolling behavior
	 * Sets up scroll event listeners and handles scroll direction detection
	 */
	useEffect(
		function handleChatWindowScroll() {
			// Early return for SSR
			if (typeof window === 'undefined') return

			// Get chat window element
			const chatWindow = document.querySelector('#chat-window')
			if (!chatWindow) {
				console.warn('Chat window element not found')
				return
			}

			/**
			 * Checks if the chat is scrolled to the bottom
			 * Uses a small threshold (5px) to account for rounding errors
			 */
			const isAtBottom = () => {
				const { scrollTop, scrollHeight, clientHeight } = chatWindow
				return scrollHeight - scrollTop - clientHeight < 5
			}

			// Variables for scroll performance optimization
			let ticking = false // Controls requestAnimationFrame throttling
			let lastKnownScrollTop = chatWindow.scrollTop
			lastScrollYRef.current = lastKnownScrollTop

			/**
			 * Scroll event handler
			 * Uses requestAnimationFrame to throttle processing for performance
			 */
			const handleScroll = () => {
				lastKnownScrollTop = chatWindow.scrollTop

				if (!ticking) {
					window.requestAnimationFrame(() => {
						processScroll(lastKnownScrollTop)
						ticking = false
					})
					ticking = true
				}
			}

			/**
			 * Processes scroll events to determine direction and update state
			 * - Tracks manual scrolling
			 * - Detects scroll direction (up/down)
			 * - Updates appropriate state based on scroll position
			 */
			const processScroll = (scrollTop: number) => {
				// Mark as manually scrolling
				isManualScrollingRef.current = true

				// Clear any existing scroll timeout
				if (scrollTimeoutRef.current) {
					clearTimeout(scrollTimeoutRef.current)
				}

				// Set timeout to detect when scrolling stops
				scrollTimeoutRef.current = setTimeout(() => {
					isManualScrollingRef.current = false

					// Check if stopped at bottom and update state
					if (isAtBottom()) {
						if (userScrolledUpRef.current) {
							userScrolledUpRef.current = false
							scrolledEnd()
						}
					}
				}, 100)

				// Handle immediate scroll position logic
				if (isAtBottom()) {
					// At bottom - update state if previously scrolled up
					if (userScrolledUpRef.current) {
						userScrolledUpRef.current = false
						scrolledEnd()
					}
				} else if (scrollTop < lastScrollYRef.current) {
					// Scrolled up - update state if not already marked as scrolled up
					if (!userScrolledUpRef.current) {
						userScrolledUpRef.current = true
						scrolledUp()
					}
				}

				// Update last scroll position for next comparison
				lastScrollYRef.current = scrollTop
			}

			// Add scroll event listener with passive flag for better performance
			chatWindow.addEventListener('scroll', handleScroll, {
				passive: true
			})

			// Cleanup function to remove listeners and clear timeouts
			return () => {
				chatWindow.removeEventListener('scroll', handleScroll)

				if (scrollTimeoutRef.current) {
					clearTimeout(scrollTimeoutRef.current)
				}
			}
		},
		[scrolledUp, scrolledEnd]
	)

	/**
	 * Handles form submission
	 * - Adds user message to the chat
	 * - Starts streaming state
	 * - Resets scroll state to bottom
	 * - Submits the prompt to the AI
	 */
	const onSubmit = async (data: ChatFormValues) => {
		const chatId = chatStore.getState().chatId
		const message = {
			role: 'user' as const,
			content: data.prompt,
			id: createId()
		} as PrismaMessage

		const newMessages = [...messages, message]

		if (session) {
			createOrAddMessages({
				messages: newMessages,
				chatId
			})
		}
		startedStreaming({
			messages: newMessages,
			chatId
		})
		console.log('newMessages', newMessages)
		userScrolledUpRef.current = false // Reset scroll state when submitting
		submitPrompt({
			filters: [],
			messages: newMessages
		})
	}

	/**
	 * Handles stopping an ongoing streaming response
	 * - Stops the AI stream
	 * - Updates streaming state
	 * - Finalizes the response message
	 */
	const onStopStreaming = useCallback(() => {
		// stop()
		streamingStopped()
		// onFinishStreaming(object as GeneratedMessage)
	}, [streamingStopped, onFinishStreaming])

	// Return memoized values
	return {
		onSubmit,
		isStreaming,
		streamingStopped,
		onStopStreaming,
		onFinishStreaming,
		variables
	}
}


type BuildChatMessageParams = {
	old: NonNullable<RouterOutputs['chats']['get']>
	message: {
		role: 'assistant'
		content: string
		recipes?: GeneratedMessage['recipes']
		id: string
	}
	chatId: string
	userId: string
}

function buildChatMessage({
	old,
	message,
	chatId,
	userId
}: BuildChatMessageParams) {
	return {
		...old,
		messages: [
			...old.messages,
			{
				...message,
				chatId,
				createdAt: new Date(),
				sortOrder: old.messages.length,
				updatedAt: new Date(),
				recipes: message.recipes
					? message.recipes.map((recipe) => ({
							...recipe,
							name: recipe.name ?? '',
							description: recipe.description ?? null,
							prepTime: recipe.prepTime ?? null,
							cookTime: recipe.cookTime ?? null,
							imgUrl: null,
							author: null,
							address: null,
							messageId: message.id,
							categories: recipe.categories ?? [],
							saved: false,
							notes: '',
							id: createId(),
							userId,
							createdAt: new Date(),
							updatedAt: new Date(),
							lastViewedAt: new Date(),
							ingredients: recipe.ingredients
								? recipe.ingredients.map((ingredient) => ({
										name: ingredient,
										id: createId(),
										checked: false,
										recipeId: null,
										listId: null
									}))
								: [],
							instructions: recipe.instructions
								? recipe.instructions.map((instruction) => ({
										description: instruction,
										id: createId(),
										recipeId: createId()
									}))
								: []
						}))
					: []
			}
		]
	}
}

'use client'

import { experimental_useObject as useObject } from '@ai-sdk/react'
import chatStore from '~/lib/chat-store'
import { useTranslations } from '~/hooks/use-translations'
import { toast } from 'sonner'
import { createSlug } from '~/lib/create-id'
import { generatedMessageSchema, type GeneratedMessage } from '~/schemas/chats'
import { useCallback, useEffect, useRef, useMemo } from 'react'
import { useScrollRef } from '~/hooks/use-scroll-to-bottom'
import { z } from 'zod'
import { useSession } from 'next-auth/react'
import { api } from '~/trpc/react'
import { type RouterOutputs } from '~/trpc/react'
import { useSessionChatId } from '~/hooks/use-chat'

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

	// State from global chat store
	const {
		isStreaming,
		messages,
		isScrollingToBottom,
		chatId,
		streaming,
		startedStreaming,
		streamingStopped,
		endedStreaming,
		scrolledEnd,
		scrolledUp
	} = chatStore((state) => state)
	const onCreateOrAddMessagesSuccess = useCallback(
		(response: RouterOutputs['chats']['createOrAddMessages']) => {
			if (response.chatId) {
				setChatId(response.chatId)
			}
		},
		[setChatId]
	)
	const { mutate: createOrAddMessages } =
		api.chats.createOrAddMessages.useMutation({
			onSuccess: (response) => {
				onCreateOrAddMessagesSuccess(response)
			}
		})
	const bottomRef = useScrollRef() // Reference to scroll to bottom

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
		const id = createSlug()
		const message = {
			role: 'assistant' as const,
			content: res?.message ?? '',
			recipes: res?.recipes,
			id
		}
		endedStreaming(message)
		// Get the latest chatId from the store
		const currentChatId = chatStore.getState().chatId
		createOrAddMessages({
			messages: [message],
			chatId: currentChatId
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
		onFinish: useCallback(
			(event: {
				object: GeneratedMessage | undefined
				error: Error | undefined
			}) => event?.object && onFinishStreaming(event?.object),
			[onFinishStreaming]
		),
		onError: useCallback(
			(error: Error) => {
				console.error('error', error)
				toast.error(t.error.somethingWentWrong)
				streamingStopped()
			},
			[t.error.somethingWentWrong, streamingStopped]
		)
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
	const onSubmit = useCallback(
		(data: ChatFormValues) => {
			const id = createSlug()
			const message = {
				role: 'user' as const,
				content: data.prompt,
				id
			}

			const newMessages = [...messages, message]

			if (session) {
				createOrAddMessages({
					messages: newMessages,
					chatId
				})
			}
			startedStreaming(newMessages)
			userScrolledUpRef.current = false // Reset scroll state when submitting
			submitPrompt({
				filters: [],
				messages: newMessages
			})
		},
		[
			messages,
			session,
			createOrAddMessages,
			startedStreaming,
			submitPrompt,
			chatId
		]
	)

	/**
	 * Handles stopping an ongoing streaming response
	 * - Stops the AI stream
	 * - Updates streaming state
	 * - Finalizes the response message
	 */
	const onStopStreaming = useCallback(() => {
		stop()
		streamingStopped()
		onFinishStreaming(object as GeneratedMessage)
	}, [stop, streamingStopped, onFinishStreaming, object])

	// Return memoized values
	return useMemo(
		() => ({
			onSubmit,
			isStreaming,
			streamingStopped,
			onStopStreaming,
			onFinishStreaming
		}),
		[
			onSubmit,
			isStreaming,
			streamingStopped,
			onStopStreaming,
			onFinishStreaming
		]
	)
}

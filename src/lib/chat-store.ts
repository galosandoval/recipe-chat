import { create } from 'zustand'
import type { GeneratedMessage, Message } from '~/schemas/chats'

type ChatStore = {
	chatId?: string
	stream: GeneratedMessage
	isStreaming: boolean
	messages: Message[]
	isScrollingToBottom: boolean
	setChatId: (chatId: string) => void
	startedStreaming: (messages: Message[]) => void
	endedStreaming: (newMessage: Message) => void
	streaming: (stream: GeneratedMessage) => void
	streamingStopped: () => void
	startNewChat: () => void
	scrolledUp: () => void
	scrolledEnd: () => void
}

const initialStream: GeneratedMessage = {
	message: '',
	recipes: []
}

const chatStore = create<ChatStore>((set) => ({
	chatId: undefined,
	stream: initialStream,
	isStreaming: false,
	messages: [],
	isScrollingToBottom: false,
	setChatId: (chatId: string) => {
		if (typeof window !== 'undefined') {
			window.sessionStorage.setItem('chatId', chatId)
		}
		return set({ chatId })
	},
	startedStreaming: (messages: Message[]) =>
		set({ isStreaming: true, messages, isScrollingToBottom: true }),
	endedStreaming: (newMessage: Message) =>
		set((state) => ({
			isStreaming: false,
			messages: [...state.messages, newMessage],
			stream: initialStream
		})),
	streaming: (stream: GeneratedMessage) => set({ stream }),
	streamingStopped: () => set({ isStreaming: false }),
	startNewChat: () =>
		set({
			isStreaming: false,
			messages: [],
			stream: initialStream
		}),
	scrolledUp: () => set({ isScrollingToBottom: false }),
	scrolledEnd: () => set({ isScrollingToBottom: true })
}))

export default chatStore

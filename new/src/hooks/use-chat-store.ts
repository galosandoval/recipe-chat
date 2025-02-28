import { create } from 'zustand'
import type { GeneratedRecipes, Message } from '~/schemas/chats'

type ChatStore = {
	stream: GeneratedRecipes
	isStreaming: boolean
	messages: Message[]
	isScrollingToBottom: boolean
	startedStreaming: (messages: Message[]) => void
	endedStreaming: (newMessage: Message) => void
	streaming: (stream: GeneratedRecipes) => void
	streamingStopped: () => void
	startNewChat: () => void
	scrolledUp: () => void
	scrolledEnd: () => void
}

const initialStream: GeneratedRecipes = {
	message: '',
	recipes: []
}

const useChatStore = create<ChatStore>((set) => ({
	stream: initialStream,
	isStreaming: false,
	messages: [],
	isScrollingToBottom: false,
	startedStreaming: (messages: Message[]) =>
		set({ isStreaming: true, messages, isScrollingToBottom: true }),
	endedStreaming: (newMessage: Message) =>
		set((state) => ({
			isStreaming: false,
			messages: [...state.messages, newMessage],
			stream: initialStream
		})),
	streaming: (stream: GeneratedRecipes) => set({ stream }),
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

export default useChatStore

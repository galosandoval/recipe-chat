import { create } from 'zustand'
import type { GeneratedRecipes, Message } from '~/schemas/chats'

type ChatStore = {
	stream: GeneratedRecipes
	isStreaming: boolean
	messages: Message[]
	startStreaming: (messages: Message[]) => void
	endStreaming: (messages: Message[]) => void
	streamReply: (stream: GeneratedRecipes) => void
	setIsStreaming: (isStreaming: boolean) => void
	startNewChat: () => void
}

const initialReply: GeneratedRecipes = {
	message: '',
	recipes: []
}

const useChatStore = create<ChatStore>((set) => ({
	stream: initialReply,
	isStreaming: false,
	messages: [],
	startStreaming: (messages: Message[]) =>
		set({ isStreaming: true, messages }),
	endStreaming: (messages: Message[]) =>
		set({ isStreaming: false, messages, stream: initialReply }),
	streamReply: (stream: GeneratedRecipes) => set({ stream }),
	setIsStreaming: (isStreaming: boolean) => set({ isStreaming }),
	startNewChat: () =>
		set({
			stream: initialReply,
			isStreaming: false,
			messages: []
		})
}))

export default useChatStore

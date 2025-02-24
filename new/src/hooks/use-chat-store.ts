import { create } from 'zustand'
import type { GeneratedRecipes, Message } from '~/schemas/chats'

type ChatStore = {
	stream: GeneratedRecipes
	isStreaming: boolean
	messages: Message[]
	startedStreaming: (messages: Message[]) => void
	endedStreaming: (messages: Message[]) => void
	streaming: (stream: GeneratedRecipes) => void
	streamingStopped: () => void
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
	startedStreaming: (messages: Message[]) =>
		set({ isStreaming: true, messages }),
	endedStreaming: (messages: Message[]) =>
		set({ isStreaming: false, messages, stream: initialReply }),
	streaming: (stream: GeneratedRecipes) => set({ stream }),
	streamingStopped: () => set({ isStreaming: false }),
	startNewChat: () =>
		set({
			stream: initialReply,
			isStreaming: false,
			messages: []
		})
}))

export default useChatStore

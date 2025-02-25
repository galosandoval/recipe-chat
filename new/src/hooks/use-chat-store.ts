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

const initialStream: GeneratedRecipes = {
	message: '',
	recipes: []
}

const useChatStore = create<ChatStore>((set) => ({
	stream: initialStream,
	isStreaming: false,
	messages: [],
	startedStreaming: (messages: Message[]) =>
		set({ isStreaming: true, messages }),
	endedStreaming: (messages: Message[]) =>
		set({ isStreaming: false, messages, stream: initialStream }),
	streaming: (stream: GeneratedRecipes) => set({ stream }),
	streamingStopped: () => set({ isStreaming: false }),
	startNewChat: () =>
		set({
			stream: initialStream,
			isStreaming: false,
			messages: []
		})
}))

export default useChatStore

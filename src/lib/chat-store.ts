import { create } from 'zustand'
import type { CreateOrAddMessages, GeneratedMessage } from '~/schemas/chats'

type ChatStore = {
	chatId?: string
	stream: GeneratedMessage
	isStreaming: boolean
	isScrollingToBottom: boolean
	mutationVariables?: CreateOrAddMessages
	setChatId: (chatId?: string) => void
	startedStreaming: (chat: CreateOrAddMessages) => void
	endedStreaming: () => void
	streaming: (stream: GeneratedMessage) => void
	streamingStopped: () => void
	startNewChat: () => void
	scrolledUp: () => void
	scrolledEnd: () => void
	// TODO: state to replace useSessionChatId()
}

const initialStream: GeneratedMessage = {
	content: '',
	recipes: []
}

const chatStore = create<ChatStore>((set) => ({
	chatId: undefined,
	stream: initialStream,
	isStreaming: false,
	isScrollingToBottom: false,
	mutationVariables: undefined,
	setChatId: (chatId?: string) => set({ chatId }),
	startedStreaming: (chat: CreateOrAddMessages) =>
		set({
			isStreaming: true,
			isScrollingToBottom: true,
			mutationVariables: chat
		}),
	endedStreaming: () =>
		set(() => ({
			isStreaming: false,
			stream: initialStream,
			mutationVariables: undefined
		})),
	streaming: (stream: GeneratedMessage) => set({ stream }),
	streamingStopped: () => set({ isStreaming: false }),
	startNewChat: () =>
		set({
			isStreaming: false,
			stream: initialStream
		}),
	scrolledUp: () => set({ isScrollingToBottom: false }),
	scrolledEnd: () => set({ isScrollingToBottom: true })
}))

export default chatStore

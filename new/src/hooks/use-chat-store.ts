import { create } from 'zustand'
import { type Message } from 'ai'

type ChatStore = {
	prompt: string
	isSendingMessage: boolean
	messages: Message[]
	setPrompt: (prompt: string) => void
	setIsSendingMessage: (isSendingMessage: boolean) => void
	setMessages: (messages: Message[]) => void
}

const useChatStore = create<ChatStore>((set) => ({
	prompt: '',
	isSendingMessage: false,
	messages: [],
	setPrompt: (prompt: string) => set({ prompt }),
	setIsSendingMessage: (isSendingMessage: boolean) =>
		set({ isSendingMessage }),
	setMessages: (messages: Message[]) => set({ messages })
}))

export default useChatStore

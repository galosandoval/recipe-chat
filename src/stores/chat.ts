import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type { GeneratedMessage } from '~/schemas/chats'
import type { Message } from '@prisma/client'

type ChatStore = {
  // UI State
  messages: Message[]
  input: string
  isSendingMessage: boolean
  stream: GeneratedMessage

  // Actions
  setInput: (input: string) => void
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  addMessage: (message: Message) => void
  setMessages: (messages: Message[]) => void
  clearMessages: () => void

  // Streaming
  setStream: (stream: GeneratedMessage) => void
  setIsSendingMessage: (isSending: boolean) => void

  // Utilities
  reset: () => void
}

const initialStream: GeneratedMessage = {
  content: '',
  recipes: []
}

const initialMessages: Message[] = []

export const chatStore = create<ChatStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    messages: initialMessages,
    input: '',
    isSendingMessage: false,
    stream: initialStream,

    // Actions
    setInput: (input: string) => set({ input }),

    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      set({ input: e.target.value })
    },

    addMessage: (message: Message) => {
      const { messages } = get()
      set({ messages: [...messages, message] })
    },

    setMessages: (messages: Message[]) => set({ messages }),

    clearMessages: () => set({ messages: initialMessages }),

    // Streaming
    setStream: (stream: GeneratedMessage) => set({ stream }),

    setIsSendingMessage: (isSendingMessage: boolean) =>
      set({ isSendingMessage }),

    // Utilities
    reset: () =>
      set({
        messages: initialMessages,
        input: '',
        isSendingMessage: false,
        stream: initialStream
      })
  }))
)

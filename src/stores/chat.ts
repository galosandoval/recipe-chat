import { create } from 'zustand'
import type { GeneratedMessage, MessageWithRecipes } from '~/schemas/chats'

type ChatStore = {
  // UI State
  messages: MessageWithRecipes[]
  input: string
  isStreaming: boolean
  stream: GeneratedMessage

  // Actions
  setInput: (input: string) => void
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  addMessage: (message: MessageWithRecipes) => void
  setMessages: (messages: MessageWithRecipes[]) => void
  clearMessages: () => void

  // Streaming
  setStream: (stream: GeneratedMessage) => void
  setIsStreaming: (isSending: boolean) => void

  // AI Submission
  triggerAISubmission: (input: string) => void

  // Utilities
  reset: () => void
}

const initialStream: GeneratedMessage = {
  content: '',
  recipes: []
}

const initialMessages: MessageWithRecipes[] = []

export const chatStore = create<ChatStore>((set, get) => ({
  // Initial state
  messages: initialMessages,
  input: '',
  isStreaming: false,
  stream: initialStream,

  // Actions
  setInput: (input: string) => set({ input }),

  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => {
    set({ input: e.target.value })
  },

  addMessage: (message: MessageWithRecipes) => {
    const { messages } = get()
    set({ messages: [...messages, message] })
  },

  setMessages: (messages: MessageWithRecipes[]) => set({ messages }),

  clearMessages: () => set({ messages: initialMessages }),

  // Streaming
  setStream: (stream: GeneratedMessage) => set({ stream }),

  setIsStreaming: (isStreaming: boolean) => set({ isStreaming }),

  // AI Submission - this will be set by SubmitMessageForm
  triggerAISubmission: () => {
    // This will be set by SubmitMessageForm when it mounts
    console.warn('triggerAISubmission called but not set up yet')
  },

  // Utilities
  reset: () =>
    set({
      messages: initialMessages,
      input: '',
      isStreaming: false,
      stream: initialStream
    })
}))

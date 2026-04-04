import { create } from 'zustand'
import type { MessageWithRecipes } from '~/schemas/chats-schema'

const CURRENT_CHAT_ID = 'currentChatId'

type ChatStore = {
  // UI State
  messages: MessageWithRecipes[]
  input: string
  isStreaming: boolean
  chatId: string
  usePantry: boolean
  chatFilterIds: string[] | null

  // Actions
  setInput: (input: string) => void
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  addMessage: (message: MessageWithRecipes) => void
  setMessages: (messages: MessageWithRecipes[]) => void
  clearMessages: () => void
  setChatId: (chatId: string) => void
  setUsePantry: (usePantry: boolean) => void
  setChatFilterIds: (ids: string[] | null) => void

  // Streaming
  setIsStreaming: (isStreaming: boolean) => void

  // AI Submission
  triggerAISubmission: (messages: MessageWithRecipes[]) => void

  // Utilities
  reset: () => void
  initializeFromStorage: () => void
}

const initialMessages: MessageWithRecipes[] = []

export const useChatStore = create<ChatStore>((set, get) => ({
  // Initial state
  messages: initialMessages,
  input: '',
  isStreaming: false,
  chatId: '',
  usePantry: false,
  chatFilterIds: null,

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

  setUsePantry: (usePantry: boolean) => set({ usePantry }),

  setChatFilterIds: (ids) => set({ chatFilterIds: ids }),

  setChatId: (chatId: string) => {
    set({ chatId })
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(CURRENT_CHAT_ID, JSON.stringify(chatId))
    }
  },

  // Initialize chatId from session storage after hydration
  initializeFromStorage: () => {
    if (typeof window === 'undefined') return

    try {
      const stored = sessionStorage.getItem(CURRENT_CHAT_ID)
      if (stored) {
        const chatId = JSON.parse(stored)
        set({ chatId })
      }
    } catch {
      // Ignore errors when reading from session storage
    }
  },

  // Streaming
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
      chatId: '',
      usePantry: false,
      chatFilterIds: null
    })
}))

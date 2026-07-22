import { create } from 'zustand'
import type { MessageWithRecipes } from '~/schemas/chats-schema'

type ChatStore = {
  // UI State
  messages: MessageWithRecipes[]
  input: string
  isStreaming: boolean
  chatId: string
  usePantry: boolean
  chatFilterIds: string[] | null
  pendingExpandRecipeId: string | null

  // Actions
  setInput: (input: string) => void
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  addMessage: (message: MessageWithRecipes) => void
  setMessages: (messages: MessageWithRecipes[]) => void
  clearMessages: () => void
  setChatId: (chatId: string) => void
  setUsePantry: (usePantry: boolean) => void
  setChatFilterIds: (ids: string[] | null) => void
  setPendingExpandRecipeId: (id: string | null) => void

  // Streaming
  setIsStreaming: (isStreaming: boolean) => void

  // Utilities
  reset: () => void
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
  pendingExpandRecipeId: null,

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

  setPendingExpandRecipeId: (id) => set({ pendingExpandRecipeId: id }),

  // The "current chat" is resolved from the server per Chat Context on entry
  // (see useResumeChat), never cached client-side — a reload re-asks rather than
  // trusting a stale local guess.
  setChatId: (chatId: string) => set({ chatId }),

  // Streaming
  setIsStreaming: (isStreaming: boolean) => set({ isStreaming }),

  // Utilities
  reset: () =>
    set({
      messages: initialMessages,
      input: '',
      isStreaming: false,
      chatId: '',
      usePantry: false,
      chatFilterIds: null,
      pendingExpandRecipeId: null
    })
}))

import { create } from 'zustand'
import type { ChatScope, MessageWithRecipes } from '~/schemas/chats-schema'

type ChatStore = {
  // UI State
  messages: MessageWithRecipes[]
  input: string
  isStreaming: boolean
  chatId: string
  usePantry: boolean
  chatFilterIds: string[] | null
  pendingExpandRecipeId: string | null
  /**
   * A chat the user picked from Chat History, waiting for the page owning its
   * Chat Context to mount. `useResumeChat` adopts it there in place of the
   * context's auto-resume chat, then clears it — the two surfaces can't hand off
   * through `chatId` directly, since entering a context clears `chatId` by
   * design. The scope travels with the id so a page that settles on its context
   * over several renders (e.g. Recipe detail, `recipes` until the recipe loads)
   * only adopts the chat once it's actually in the matching context.
   */
  pendingChat: { chatId: string; scope: ChatScope } | null

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
  setPendingChat: (pending: { chatId: string; scope: ChatScope } | null) => void

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
  pendingChat: null,

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

  setPendingChat: (pending) => set({ pendingChat: pending }),

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
      pendingExpandRecipeId: null,
      pendingChat: null
    })
}))

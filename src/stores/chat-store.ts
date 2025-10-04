import { create } from 'zustand'
import type {
  GeneratedMessage,
  MessageWithRecipes
} from '~/schemas/chats-schema'

const CURRENT_CHAT_ID = 'currentChatId'

export type StreamingStatus = 'idle' | 'streaming' | 'finished' | 'generating'

type ChatStore = {
  // UI State
  messages: MessageWithRecipes[]
  input: string
  streamingStatus: StreamingStatus
  stream: GeneratedMessage
  chatId: string

  // Actions
  setInput: (input: string) => void
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  addMessage: (message: MessageWithRecipes) => void
  setMessages: (messages: MessageWithRecipes[]) => void
  clearMessages: () => void
  setChatId: (chatId: string) => void

  // Streaming
  setStream: (stream: GeneratedMessage) => void
  setStreamingStatus: (streamingStatus: StreamingStatus) => void

  // AI Submission
  triggerAISubmission: (messages: MessageWithRecipes[]) => void

  // Utilities
  reset: () => void
  initializeFromStorage: () => void
}

const initialStream: GeneratedMessage = {
  content: '',
  recipes: []
}

const initialMessages: MessageWithRecipes[] = []

// Always return empty string initially to avoid hydration mismatch
// The actual chatId will be set via setChatId when needed
const getInitialChatId = (): string => {
  return ''
}

export const chatStore = create<ChatStore>((set, get) => ({
  // Initial state
  messages: initialMessages,
  input: '',
  streamingStatus: 'idle',
  stream: initialStream,
  chatId: getInitialChatId(),

  // Actions
  setInput: (input: string) => set({ input }),

  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => {
    set({ input: e.target.value })
  },

  addMessage: (message: MessageWithRecipes) => {
    const { messages } = get()
    console.log('addMessage', message)
    set({ messages: [...messages, message] })
  },

  setMessages: (messages: MessageWithRecipes[]) => set({ messages }),

  clearMessages: () => set({ messages: initialMessages }),

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
  setStream: (stream: GeneratedMessage) => set({ stream }),

  setStreamingStatus: (streamingStatus: StreamingStatus) =>
    set({ streamingStatus }),

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
      streamingStatus: 'idle',
      stream: initialStream,
      chatId: ''
    })
}))

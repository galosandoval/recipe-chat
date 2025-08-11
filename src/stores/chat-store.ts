import { create } from 'zustand'
import type { GeneratedMessage, MessageWithRecipes } from '~/schemas/chats'

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
}

const initialStream: GeneratedMessage = {
  content: '',
  recipes: []
}

const initialMessages: MessageWithRecipes[] = []

// Helper function to get initial chat ID from session storage
const getInitialChatId = (): string => {
  if (typeof window === 'undefined') return ''

  try {
    const stored = sessionStorage.getItem(CURRENT_CHAT_ID)
    return stored ? JSON.parse(stored) : ''
  } catch {
    return ''
  }
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

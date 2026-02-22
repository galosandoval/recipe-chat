import { create } from 'zustand'
import type { ChatContext } from '~/schemas/chats-schema'

type ChatPanelStore = {
  isOpen: boolean
  context: ChatContext
  open: (context?: ChatContext) => void
  close: () => void
  toggle: (context?: ChatContext) => void
  setContext: (context: ChatContext) => void
}

export const useChatPanelStore = create<ChatPanelStore>((set) => ({
  isOpen: false,
  context: { page: 'recipes' },
  open: (context) =>
    set((s) => ({ isOpen: true, ...(context ? { context } : { context: s.context }) })),
  close: () => set({ isOpen: false }),
  toggle: (context) =>
    set((s) => ({
      isOpen: !s.isOpen,
      ...(context ? { context } : { context: s.context })
    })),
  setContext: (context) => set({ context })
}))

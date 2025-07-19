'use client'

import { createContext, useEffect, useState } from 'react'

export const CURRENT_CHAT_ID = 'currentChatId'

export const ChatIdContext = createContext<{
  chatId: string | undefined
  changeChatId: (chatId: string | undefined) => void
}>({
  chatId: undefined,
  changeChatId: () => {}
})

export function ChatIdProvider({ children }: { children: React.ReactNode }) {
  const hasSession =
    typeof window != 'undefined' &&
    typeof sessionStorage?.getItem(CURRENT_CHAT_ID) === 'string'
  const [chatId, setChatId] = useState<string | undefined>(
    hasSession
      ? JSON.parse(sessionStorage.getItem(CURRENT_CHAT_ID) as string)
      : undefined
  )
  const changeChatId = (chatId: string | undefined) => {
    setChatId(chatId)
    sessionStorage.setItem(CURRENT_CHAT_ID, JSON.stringify(chatId))
  }
  return (
    <ChatIdContext.Provider value={{ chatId, changeChatId }}>
      {children}
    </ChatIdContext.Provider>
  )
}

export function useSessionChatId() {
  const hasSession =
    typeof window != 'undefined' &&
    typeof sessionStorage?.getItem(CURRENT_CHAT_ID) === 'string'
  console.log('hasSession', hasSession)
  const [chatId, setChatId] = useState<string | undefined>(
    hasSession
      ? JSON.parse(sessionStorage.getItem(CURRENT_CHAT_ID) as string)
      : undefined
  )

  const changeChatId = (chatId: string | undefined) => {
    setChatId(chatId)
    sessionStorage.setItem(CURRENT_CHAT_ID, JSON.stringify(chatId))
  }

  useEffect(() => {
    if (hasSession) {
      const currentChatId = sessionStorage.getItem(CURRENT_CHAT_ID)
      const handleStorageChange = () => {
        setChatId(
          currentChatId ? (JSON.parse(currentChatId) as string) : undefined
        )
      }

      window.addEventListener('storage', handleStorageChange)

      return () => {
        window.removeEventListener('storage', handleStorageChange)
      }
    }
  }, [])
  console.log('chatId', chatId)
  return [chatId, changeChatId] as const
}

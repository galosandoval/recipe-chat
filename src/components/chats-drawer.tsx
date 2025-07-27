import { createContext, useContext, useState } from 'react'
import { useParams, usePathname } from 'next/navigation'
import { useTranslations } from '~/hooks/use-translations'
import { useSessionChatId } from '~/hooks/use-session-chat-id'
import { useSession } from 'next-auth/react'
import { chatStore } from '~/stores/chat'
import type { Chat, Message } from '@prisma/client'
import { ListBulletIcon } from './icons'
import { formatTimeAgo } from '~/utils/relative-time-format'
import { ScreenLoader } from './loaders/screen'
import { api } from '~/trpc/react'
import { Drawer } from './drawer'

export const ChatsDrawerContext = createContext<{
  isOpen: boolean
  handleToggleDrawer: () => void
}>({
  isOpen: false,
  handleToggleDrawer: () => {}
})

export const ChatsDrawerProvider = ({
  children
}: {
  children: React.ReactNode
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const handleToggleDrawer = () => {
    setIsOpen((state) => !state)
  }

  if (!pathname.includes('chat')) {
    return <>{children}</>
  }

  return (
    <ChatsDrawerContext.Provider value={{ isOpen, handleToggleDrawer }}>
      {children}
    </ChatsDrawerContext.Provider>
  )
}

export function useChatsDrawer() {
  const { isOpen, handleToggleDrawer } = useContext(ChatsDrawerContext)
  return { isOpen, handleToggleDrawer }
}

const useGetChats = () => {
  const { status: authStatus, data } = useSession()

  const isAuthenticated = authStatus === 'authenticated'

  return {
    ...api.chats.getChats.useQuery(
      { userId: data?.user.id || '' },

      {
        // onSuccess,
        enabled: isAuthenticated
      }
    ),
    isAuthenticated
  }
}

function ChatList({
  handleToggleChatsModal
}: {
  handleToggleChatsModal: () => void
}) {
  const t = useTranslations()
  const [chatId, changeChatId] = useSessionChatId()
  const { data, status, isAuthenticated } = useGetChats()

  if (!isAuthenticated) {
    return null
  }

  if (status === 'error') {
    return <div>{t.error.somethingWentWrong}</div>
  }

  const handleChangeChat = (
    chat: Chat & {
      messages: Message[]
    }
  ) => {
    changeChatId(chat.id)
    handleToggleChatsModal()
  }

  if (status === 'success') {
    return (
      <div className='flex h-full flex-col justify-end gap-2'>
        {data.length > 0 && (
          <div className='flex items-center justify-center gap-2'>
            <h2 className='mt-0 mb-0'>{t.chatWindow.chats}</h2>
            <ListBulletIcon />
          </div>
        )}
        <div className=''>
          {data.map((chat) => (
            <ChatOption
              key={chat.id}
              chat={chat}
              chatId={chatId}
              onClick={() => handleChangeChat(chat)}
            />
          ))}
        </div>
      </div>
    )
  }

  return <ScreenLoader />
}

function ChatOption({
  chatId,
  chat,
  onClick
}: {
  chatId?: string
  chat: Chat & {
    messages: Message[]
  }
  onClick: () => void
}) {
  const params = useParams()

  if (chat.messages.length === 0) {
    return null
  }

  const { content, role } = chat.messages[0]

  let message = content

  if (role === 'assistant') {
    try {
      const recipe = transformContentToRecipe({ content: content })
      message = recipe.name
    } catch (error) {
      message = content
    }
  }

  return (
    <div
      className={`hover:bg-primary-content flex flex-col rounded px-2 py-2 select-none ${
        chatId === chat.id ? 'bg-primary-content' : ''
      }`}
      onClick={onClick}
    >
      <p
        // onClick={() => handleChangeChat(chat)}
        className={`mt-1 mb-1 truncate ${
          chatId === chat.id ? 'text-primary' : ''
        }`}
      >
        {message}
      </p>

      <span className='text-primary ml-auto text-xs'>
        {formatTimeAgo(chat.updatedAt, params.lang as string)}
      </span>
    </div>
  )
}

export function ChatsDrawer() {
  const { isOpen, handleToggleDrawer } = useChatsDrawer()

  return (
    <Drawer closeModal={handleToggleDrawer} isOpen={isOpen}>
      <div className='flex h-full flex-col justify-between'>
        <ChatList handleToggleChatsModal={handleToggleDrawer} />
      </div>
    </Drawer>
  )
}

function transformContentToRecipe({ content }: { content: string }) {
  return JSON.parse(content) as {
    name: string
    description: string
    prepTime: string
    cookTime: string
    categories: string[]
    instructions: string[]
    ingredients: string[]
  }
}

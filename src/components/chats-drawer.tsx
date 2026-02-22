import { useTranslations, useLocale } from '~/hooks/use-translations'
import { useSession } from 'next-auth/react'
import type { Chat, Message } from '@prisma/client'
import { formatTimeAgo } from '~/lib/relative-time-format'
import { ScreenLoader } from './loaders/screen'
import { api } from '~/trpc/react'
import { Drawer } from './drawer'
import { cn } from '~/lib/utils'
import { useChatStore } from '~/stores/chat-store'
import { LoadingSpinner } from './loaders/loading-spinner'

export function useChatsDrawer() {}

const useGetChats = () => {
  const { status: authStatus, data } = useSession()

  const isAuthenticated = authStatus === 'authenticated'

  return {
    ...api.chats.getChats.useQuery(
      { userId: data?.user.id || '' },

      {
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
  const { chatId, setChatId } = useChatStore()
  const { data, status, isAuthenticated } = useGetChats()

  if (!isAuthenticated) {
    return null
  }

  if (status === 'pending') {
    return (
      <div className='grid h-[30svh] place-items-center'>
        <LoadingSpinner />
      </div>
    )
  }

  if (status === 'error') {
    return <div>{t.error.somethingWentWrong}</div>
  }

  const handleChangeChat = (
    chat: Chat & {
      messages: Message[]
    }
  ) => {
    setChatId(chat.id)
    handleToggleChatsModal()
  }

  if (status === 'success') {
    return (
      <div className='flex h-full flex-col justify-end gap-2'>
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
  const locale = useLocale()

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
      className={cn(
        'hover:bg-background flex flex-col rounded-md px-2 py-2 select-none',
        chatId === chat.id && 'bg-secondary'
      )}
      onClick={onClick}
    >
      <p className='mt-1 mb-1 truncate'>{message}</p>

      <span className='text-primary ml-auto text-xs'>
        {formatTimeAgo(chat.updatedAt, locale)}
      </span>
    </div>
  )
}

export function ChatsDrawer({
  open,
  onOpenChange,
  trigger = null
}: {
  open: boolean
  onOpenChange: () => void
  trigger?: React.ReactNode
}) {
  const t = useTranslations()
  return (
    <Drawer
      trigger={trigger}
      formId='chats-drawer'
      onOpenChange={onOpenChange}
      open={open}
      title={t.chat.chatsDrawer.title}
    >
      <div className='flex h-full flex-col justify-between'>
        <ChatList handleToggleChatsModal={onOpenChange} />
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

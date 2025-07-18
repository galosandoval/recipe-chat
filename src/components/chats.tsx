import { type Chat, type Message } from '@prisma/client'
import {
  AdjustmentsHorizontalIcon,
  ChatBubbleLeftIcon,
  ListBulletIcon
} from './icons'
import { Drawer } from './drawer'
import { formatTimeAgo } from '~/utils/relative-time-format'
import { api } from '~/trpc/react'
import { useSession } from 'next-auth/react'
import { ScreenLoader } from './loaders/screen'
import { useTranslations } from '~/hooks/use-translations'
import { useParams } from 'next/navigation'
import { type Session } from 'next-auth'
import { ValuePropsHeader } from './value-props'
import { transformContentToRecipe } from '~/hooks/use-chat'

export function ChatsSection({
  handleChangeChat,
  chatId
}: {
  handleChangeChat: (
    chat: Chat & {
      messages: Message[]
    }
  ) => void
  chatId?: string
}) {
  const t = useTranslations()

  const { status: authStatus, data: session } = useSession()

  const isAuthenticated = authStatus === 'authenticated'

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className='flex w-full max-w-sm flex-col items-center justify-center'>
      <ValuePropsHeader
        icon={<ChatBubbleLeftIcon />}
        label={t.chatWindow.chats}
      />

      <div className='flex w-full flex-col items-center gap-4'>
        <Chats
          isAuthenticated={isAuthenticated}
          chatId={chatId}
          session={session}
          handleChangeChat={handleChangeChat}
        />
      </div>
    </div>
  )
}

function Chats({
  chatId,
  isAuthenticated,
  session,
  handleChangeChat
}: {
  chatId?: string
  isAuthenticated: boolean
  session: Session | null
  handleChangeChat: (
    chat: Chat & {
      messages: Message[]
    }
  ) => void
}) {
  const t = useTranslations()

  const { data, status } = api.chats.getChats.useQuery(
    { userId: session?.user.id || '' },
    {
      enabled: isAuthenticated
    }
  )

  if (status === 'error') {
    return <div>{t.error.somethingWentWrong}</div>
  }

  if (status === 'success') {
    if (data.length === 0) {
      return <p className='px-4'>{t.chatWindow.noChats}</p>
    }

    return (
      <div className='flex h-full w-full flex-col justify-end gap-2'>
        {data.map((chat) => (
          <ChatOption
            key={chat.id}
            chat={chat}
            chatId={chatId}
            handleChangeChat={handleChangeChat}
          />
        ))}
      </div>
    )
  }

  return <div className=''>{t.loading.screen}</div>
}

export function ChatsSideBarButton({
  chatId,
  isChatsModalOpen,
  handleToggleChatsModal,
  handleChangeChat
}: {
  chatId?: string
  isChatsModalOpen: boolean
  handleChangeChat: (
    chat: Chat & {
      messages: Message[]
    }
  ) => void
  handleToggleChatsModal: () => void
}) {
  return (
    <>
      <button
        onClick={handleToggleChatsModal}
        className='btn btn-circle btn-ghost justify-self-start'
      >
        <AdjustmentsHorizontalIcon />
      </button>

      <Drawer closeModal={handleToggleChatsModal} isOpen={isChatsModalOpen}>
        <div className='flex h-full flex-col justify-between'>
          <ChatList chatId={chatId} handleChangeChat={handleChangeChat} />
        </div>
      </Drawer>
    </>
  )
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
  chatId,
  handleChangeChat
}: {
  chatId?: string
  handleChangeChat: (
    chat: Chat & {
      messages: Message[]
    }
  ) => void
}) {
  const t = useTranslations()

  const { data, status, isAuthenticated } = useGetChats()

  if (!isAuthenticated) {
    return null
  }

  if (status === 'error') {
    return <div>{t.error.somethingWentWrong}</div>
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
              handleChangeChat={handleChangeChat}
            />
          ))}
        </div>
      </div>
    )
  }

  return <ScreenLoader />
}

function ChatOption({
  chat,
  chatId,
  handleChangeChat
}: {
  chat: Chat & {
    messages: Message[]
  }
  chatId?: string
  handleChangeChat: (
    chat: Chat & {
      messages: Message[]
    }
  ) => void
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
    >
      <p
        onClick={() => handleChangeChat(chat)}
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

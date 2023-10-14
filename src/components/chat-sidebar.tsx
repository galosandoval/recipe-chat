import { Chat, Message } from '@prisma/client'
import {
  AdjustmentsHorizontalIcon,
  ChatBubbleLeftIcon,
  ListBulletIcon
} from './icons'
import { Drawer } from './drawer'
import { formatTimeAgo } from 'utils/relative-time-format'
import { api } from 'utils/api'
import { useSession } from 'next-auth/react'
import { ScreenLoader } from './loaders/screen'
import { useTranslation } from 'hooks/useTranslation'
import { useRouter } from 'next/router'

const useGetChats = (
  onSuccess: (
    data: (Chat & {
      messages: Message[]
    })[]
  ) => void
) => {
  const { status: authStatus, data } = useSession()

  const isAuthenticated = authStatus === 'authenticated'

  return api.chat.getChats.useQuery(
    { userId: data?.user.id || '' },

    {
      onSuccess,
      enabled: isAuthenticated,
      keepPreviousData: true
    }
  )
}

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
  const t = useTranslation()

  return (
    <div className='flex flex-col items-center justify-center w-full'>
      <div className='flex items-center gap-2'>
        <h2 className='mb-2 mt-2'>{t('chat-window.chats')}</h2>
        <ChatBubbleLeftIcon />
      </div>
      <div className='flex w-full flex-col items-center gap-4'>
        <Chats chatId={chatId} handleChangeChat={handleChangeChat} />
      </div>
    </div>
  )
}

function Chats({
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
  const t = useTranslation()

  const { status: authStatus, data: session } = useSession()

  const isAuthenticated = authStatus === 'authenticated'

  const { data, status } = api.chat.getChats.useQuery(
    { userId: session?.user.id || '' },
    {
      enabled: isAuthenticated,
      keepPreviousData: true
    }
  )

  if (status === 'error') {
    return <div>{t('error.something-went-wrong')}</div>
  }

  if (status === 'success') {
    if (data.length === 0) {
      return <div className=''>{t('chat-window.no-chats')}</div>
    }

    return (
      <div className='flex h-full flex-col justify-end gap-2 w-full'>
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

  return <div className=''>{t('loading')}</div>
}

export function ChatsSideBarButton({
  chatId,
  isChatsModalOpen,
  onSuccess,
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
  onSuccess: (
    data: (Chat & {
      messages: Message[]
    })[]
  ) => void
}) {
  return (
    <>
      <button
        onClick={handleToggleChatsModal}
        className="justify-self-start' btn-ghost btn-circle btn"
      >
        <AdjustmentsHorizontalIcon />
      </button>

      <Drawer closeModal={handleToggleChatsModal} isOpen={isChatsModalOpen}>
        <div className='flex h-full flex-col justify-between'>
          <ChatList
            onSuccess={onSuccess}
            chatId={chatId}
            handleChangeChat={handleChangeChat}
          />
        </div>
      </Drawer>
    </>
  )
}

function ChatList({
  chatId,
  handleChangeChat,
  onSuccess
}: {
  chatId?: string
  handleChangeChat: (
    chat: Chat & {
      messages: Message[]
    }
  ) => void
  onSuccess: (
    data: (Chat & {
      messages: Message[]
    })[]
  ) => void
}) {
  const t = useTranslation()

  const { data, status } = useGetChats(onSuccess)

  if (status === 'error') {
    return <div>{t('error.something-went-wrong')}</div>
  }

  if (status === 'success') {
    return (
      <div className='flex h-full flex-col justify-end gap-2'>
        {data.length > 0 && (
          <div className='flex items-center justify-center gap-2'>
            <h2 className='mb-0 mt-0'>{t('chat-window.chats')}</h2>
            <ListBulletIcon />
          </div>
        )}
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
  const router = useRouter()

  const { content, role } = chat.messages[0]

  let message = content

  let fieldToIndex = 'name:'
  if (router.locale === 'es') {
    fieldToIndex = 'nombre:'
  }

  if (role === 'assistant') {
    const nameIdx = content.toLowerCase().indexOf(fieldToIndex)

    if (nameIdx !== -1) {
      const endIdx = content.indexOf('\n', nameIdx)

      if (endIdx !== -1) {
        message = content.slice(nameIdx + fieldToIndex.length + 1, endIdx)
      }
    }
  }

  return (
    <div
      className={`flex select-none flex-col px-2 py-2 hover:bg-primary-content ${
        chatId === chat.id ? 'bg-primary-content' : ''
      }`}
    >
      <div
        onClick={() => handleChangeChat(chat)}
        className={`flex items-center gap-2 ${
          chatId === chat.id ? 'text-primary' : ''
        }`}
      >
        <span
          className={`text-base-content ${
            chatId === chat.id ? 'text-primary' : ''
          }`}
        >
          {message}
        </span>
      </div>

      <span className='self-end text-xs text-primary'>
        {formatTimeAgo(chat.updatedAt, router.locale)}
      </span>
    </div>
  )
}

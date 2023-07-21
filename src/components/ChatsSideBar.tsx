import { Chat, Message } from '@prisma/client'
import { AdjustmentsHorizontalIcon, ListBulletIcon } from './Icons'
import { Drawer } from './Drawer'
import { formatTimeAgo } from 'utils/relativeTimeFormat'
import { RecipeFiltersType } from './RecipeFilters'
import { memo } from 'react'
import { api } from 'utils/api'
import { useSession } from 'next-auth/react'
import { ScreenLoader } from './loaders/ScreenLoader'

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
    { userId: data?.user.id || 0 },
    {
      onSuccess,
      enabled: isAuthenticated
    }
  )
}

export const ChatsSideBarButton = memo(function ChatsSideBarButton({
  chatId,
  isChatsModalOpen,
  recipeFilters,
  onSuccess,
  handleToggleChatsModal,
  handleChangeChat
}: {
  chatId?: number
  isChatsModalOpen: boolean
  recipeFilters: RecipeFiltersType
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
          {/* <RecipeFilters {...recipeFilters} /> */}

          <ChatList
            onSuccess={onSuccess}
            chatId={chatId}
            handleChangeChat={handleChangeChat}
          />
        </div>
      </Drawer>
    </>
  )
})

function ChatList({
  chatId,
  handleChangeChat,
  onSuccess
}: {
  chatId?: number
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
  const { data, status } = useGetChats(onSuccess)

  if (status === 'error') {
    return <div>Error</div>
  }
  if (status === 'success') {
    return (
      <div className='flex h-full flex-col justify-end gap-2 pb-8'>
        {data.length > 0 && (
          <div className='flex items-center justify-center gap-2'>
            <h2 className='mb-0 mt-0'>Recent chats</h2>
            <ListBulletIcon />
          </div>
        )}
        {[...data].reverse().map((chat) => (
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
  chatId?: number
  handleChangeChat: (
    chat: Chat & {
      messages: Message[]
    }
  ) => void
}) {
  const { content, role } = chat.messages[0]

  let message = content

  if (role === 'assistant') {
    const nameIdx = content.toLowerCase().indexOf('name:')
    if (nameIdx !== -1) {
      const endIdx = content.indexOf('\n', nameIdx)
      if (endIdx !== -1) {
        message = content.slice(nameIdx + 6, endIdx)
      }
    }
  }

  return (
    <div
      className={`flex flex-col px-2 py-2 ${
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
        {formatTimeAgo(chat.updatedAt)}
      </span>
    </div>
  )
}

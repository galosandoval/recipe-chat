import { Chat, Message } from '@prisma/client'
import { ChatsType } from 'hooks/chatHooks'
import { AdjustmentsHorizontalIcon, ListBulletIcon } from './Icons'
import { Drawer } from './Drawer'
import { formatTimeAgo } from 'utils/relativeTimeFormat'
import { RecipeFilters, RecipeFiltersType } from './RecipeFilters'

export function ChatsSideBarButton({
  chats,
  chatId,
  isChatsModalOpen,
  recipeFilters,
  handleToggleChatsModal,
  handleChangeChat
}: {
  chats: ChatsType
  chatId?: number
  isChatsModalOpen: boolean
  recipeFilters: RecipeFiltersType
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
        className="justify-self-start' btn-ghost btn-circle btn"
      >
        <AdjustmentsHorizontalIcon />
      </button>

      <Drawer closeModal={handleToggleChatsModal} isOpen={isChatsModalOpen}>
        <div className='flex h-full flex-col justify-between'>
          <RecipeFilters {...recipeFilters} />

          <ChatList
            chats={chats}
            chatId={chatId}
            handleChangeChat={handleChangeChat}
          />
        </div>
      </Drawer>
    </>
  )
}

function ChatList({
  chats,
  chatId,
  handleChangeChat
}: {
  chats: ChatsType
  chatId?: number
  handleChangeChat: (
    chat: Chat & {
      messages: Message[]
    }
  ) => void
}) {
  const { data, status } = chats

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

  return <div>Error</div>
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

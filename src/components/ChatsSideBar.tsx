import { Chat, Message } from '@prisma/client'
import { ChatsType, UseRecipeFilters } from 'hooks/chatHooks'
import {
  CheckIcon,
  AdjustmentsHorizontalIcon,
  PencilSquareIcon,
  FunnelIcon,
  ListBulletIcon,
  PlusCircleIcon,
  XCircleIcon,
  XIcon
} from './Icons'
import { Drawer } from './Drawer'
import { formatTimeAgo } from 'utils/relativeTimeFormat'

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
  recipeFilters: UseRecipeFilters
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

function RecipeFilters({
  filtersArr,
  handleSubmit,
  onSubmit,
  filters,
  register,
  handleCheck,
  isBtnDisabled,
  canDelete,
  handleRemoveFilter,
  handleToggleCanDelete
}: UseRecipeFilters) {
  return (
    <div className='mt-2 flex flex-col items-center justify-center gap-2 px-2'>
      <div className='flex items-center gap-2'>
        <h2 className='mb-0 mt-0'>Filters</h2>
        <FunnelIcon />
      </div>

      <div className='flex flex-wrap gap-2'>
        {filtersArr.length > 0 && (
          <button
            onClick={handleToggleCanDelete}
            className={`badge badge-ghost flex h-fit items-center gap-1 py-0`}
          >
            <span>
              {canDelete ? <XIcon size={5} /> : <PencilSquareIcon size={5} />}
            </span>
          </button>
        )}

        {filtersArr.map((filter) => {
          const checked = filters[filter] && !canDelete
          return (
            <button
              onClick={
                canDelete
                  ? () => handleRemoveFilter(filter)
                  : () => handleCheck(filter)
              }
              key={filter}
              className={`badge flex h-fit items-center gap-1 py-0 ${
                canDelete
                  ? 'badge-error badge-outline'
                  : checked
                  ? 'badge-primary badge-outline'
                  : 'badge-ghost'
              }`}
            >
              <span className='flex items-center'>
                {checked && <CheckIcon size={4} />}
                <span className=''>{filter}</span>
                {canDelete && <XCircleIcon size={5} />}
              </span>
            </button>
          )
        })}
      </div>

      <form className='join' onSubmit={handleSubmit(onSubmit)}>
        <input
          {...register('name')}
          className='input-bordered input input-sm join-item'
          placeholder='New filter'
        />
        <button
          type='submit'
          disabled={isBtnDisabled}
          className='no-animation btn-sm join-item btn rounded-r-full'
        >
          <PlusCircleIcon />
        </button>
      </form>
    </div>
  )
}

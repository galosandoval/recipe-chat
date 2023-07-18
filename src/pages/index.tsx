import { Message as PrismaMessage } from '@prisma/client'
import { AuthModal } from 'components/AuthModal'
import { Button } from 'components/Button'
import { MyHead } from 'components/Head'
import {
  BookmarkOutlineIcon,
  ChatBubbleLeftIcon,
  PlusIcon,
  UserCircleIcon
} from 'components/Icons'
import { ValueProps } from 'components/ValueProps'
import {
  ChangeEventHandler,
  FormEvent,
  MouseEvent,
  useEffect,
  useReducer,
  useRef,
  useState
} from 'react'
import { ChatLoader } from 'components/loaders/ChatBubbleLoader'
import { toast } from 'react-hot-toast'
import { infoToastOptions } from 'components/Toast'
import { useChat as useAiChat } from 'ai/react'
import { useRecipeFilters } from 'components/RecipeFilters'
import { api } from 'utils/api'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'

export default function PublicChatView() {
  const {
    chatRef,
    // recipeFilters,
    input,
    messages,
    isSendingMessage,

    handleInputChange,
    handleSubmit,
    handleFillMessage,
    handleScrollIntoView,
    handleStartNewChat
  } = useChat()

  return (
    <>
      <MyHead title='Listy - Chat' />
      <div className='pt-16'>
        <div className='mx-auto flex flex-col pb-12'>
          <div className='relative flex flex-col gap-4'>
            {messages.length === 0 ? (
              <ValueProps handleFillMessage={handleFillMessage} />
            ) : (
              <MessageList
                data={messages as []}
                isSendingMessage={isSendingMessage}
                handleStartNewChat={handleStartNewChat}
              />
            )}
            <div ref={chatRef}></div>
          </div>
          <SubmitMessageForm
            input={input}
            isSendingMessage={isSendingMessage}
            handleScrollIntoView={handleScrollIntoView}
            handleSubmit={handleSubmit}
            handleInputChange={handleInputChange}
          />
        </div>
      </div>
    </>
  )
}

type MessageListProps = {
  data: PrismaMessage[]
  isSendingMessage: boolean

  handleStartNewChat: () => void
}

function MessageList({
  data,
  isSendingMessage,
  handleStartNewChat
}: MessageListProps) {
  return (
    <div>
      <div className='mt-2 grid grid-cols-3 px-2'>
        <div></div>
        <div className='flex items-center justify-center gap-2'>
          <h2 className='mb-2 mt-2'>Chat</h2>
          <ChatBubbleLeftIcon />
        </div>
        <button
          onClick={handleStartNewChat}
          className='btn-ghost btn-circle btn justify-self-end'
        >
          <PlusIcon />
        </button>
      </div>
      {data.map((m, i) => (
        <Message
          message={m}
          messages={data}
          key={m?.content || '' + i}
          isSendingMessage={isSendingMessage}
        />
      ))}
      {isSendingMessage && data.at(-1)?.role === 'user' && <ChatLoader />}
    </div>
  )
}

function Message({
  message,
  messages,
  isSendingMessage
}: {
  message: PrismaMessage
  messages: PrismaMessage[]
  isSendingMessage: boolean
}) {
  const { handleCloseModal, handleOpenModal, isAuthModalOpen } = useAuthModal()

  if (message.role === 'assistant') {
    return (
      <>
        <div className='flex flex-col bg-primary-content p-4'>
          <div className='flex justify-start gap-2'>
            <div>
              <UserCircleIcon />
            </div>

            <div className='flex flex-col'>
              <p className='mb-0 mt-0 whitespace-pre-line'>
                {message.content || ''}
              </p>
            </div>
          </div>

          <div className='grid w-full grid-flow-col place-items-end gap-2'>
            {isSendingMessage ? null : (
              <Button
                className='btn-ghost btn-circle btn'
                onClick={handleOpenModal}
              >
                <BookmarkOutlineIcon />
              </Button>
            )}
          </div>
        </div>

        <AuthModal
          messages={messages}
          closeModal={handleCloseModal}
          isOpen={isAuthModalOpen}
        />
      </>
    )
  }

  return (
    <div className='flex flex-col items-start bg-base-200 p-4'>
      <div className='bg-primary-base-100 flex gap-2 self-end'>
        <div className='flex flex-col items-end'>
          <p className='mb-0 mt-0 whitespace-pre-line'>
            {message?.content || ''}
          </p>
        </div>

        <div>
          <UserCircleIcon />
        </div>
      </div>
    </div>
  )
}

function useAuthModal() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  const handleOpenModal = () => {
    setIsAuthModalOpen(true)
    toast('Create an account or login to save recipes', infoToastOptions)
  }

  const handleCloseModal = () => {
    setIsAuthModalOpen(false)
  }

  return {
    isAuthModalOpen,
    handleOpenModal,
    handleCloseModal
  }
}

const useChat = () => {
  const [state, dispatch] = useChatReducer({
    chatId: undefined
  })
  const router = useRouter()
  const { data } = useSession()
  const userId = data?.user.id

  const utils = api.useContext()
  console.log('data', data)

  useEffect(() => {
    if (userId) {
      utils.chat.getChats.prefetch({ userId })
      router.push('/chat')
    }
  }, [userId])

  const {
    messages,
    input,
    setInput,
    handleInputChange,
    stop,
    handleSubmit: submitMessages,
    isLoading: isSendingMessage,
    setMessages
  } = useAiChat()

  useEffect(() => {
    if (state.chatId) {
      localStorage.currentChatId = JSON.stringify(state.chatId)
    }
  }, [state.chatId])

  useEffect(() => {
    if (
      typeof window !== undefined &&
      typeof localStorage.currentChatId === 'string'
    ) {
      dispatch({
        type: 'chatIdChanged',
        payload: JSON.parse(localStorage.currentChatId) as number
      })
    }
  }, [dispatch])

  const chatRef = useRef<HTMLDivElement>(null)

  const handleScrollIntoView = () => {
    chatRef.current?.scrollIntoView({ behavior: 'auto' })
  }

  const [isChatsModalOpen, setIsChatsModalOpen] = useState(false)

  const handleFillMessage = (e: MouseEvent<HTMLButtonElement>) => {
    setInput(e.currentTarget.innerText.toLowerCase())
  }

  const handleStartNewChat = () => {
    setMessages([])
    dispatch({ type: 'chatIdChanged', payload: undefined })
  }

  const handleToggleChatsModal = () => {
    setIsChatsModalOpen((state) => !state)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    if (isSendingMessage) {
      stop()
    } else {
      console.log('event', event.currentTarget)
      submitMessages(event)
    }
  }
  const recipeFilters = useRecipeFilters()

  return {
    chatRef,
    recipeFilters,
    state,
    isChatsModalOpen,
    input,
    messages,
    isSendingMessage,

    handleInputChange,
    handleToggleChatsModal,
    handleStartNewChat,
    handleScrollIntoView,
    handleFillMessage,
    handleSubmit
  }
}

type ChatState = {
  chatId?: number
}

function useChatReducer(initialState: ChatState) {
  const [state, dispatch] = useReducer(chatReducer, initialState)

  return [state, dispatch] as const
}

type ChatAction =
  | {
      type: 'chatIdChanged'
      payload: number | undefined
    }
  | {
      type: 'reset'
      payload: undefined
    }

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  const { type, payload } = action
  switch (type) {
    case 'chatIdChanged':
      return {
        ...state,
        chatId: payload
      }

    case 'reset':
      return {
        chatId: undefined
      }

    default:
      return state
  }
}

export function SubmitMessageForm({
  handleScrollIntoView,
  handleInputChange,
  handleSubmit,
  isSendingMessage,
  input
}: {
  handleScrollIntoView: () => void
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
  handleInputChange: ChangeEventHandler<HTMLTextAreaElement>
  input: string
  isSendingMessage: boolean
}) {
  return (
    <form
      onSubmit={handleSubmit}
      className='fixed bottom-0 flex w-full items-center'
    >
      <div className='prose mx-auto flex w-full items-center bg-base-300/75 md:mb-2 md:rounded-lg'>
        <div className='flex w-full px-2 py-1'>
          <textarea
            value={input}
            onChange={handleInputChange}
            placeholder='Ask about a recipe'
            className='input-bordered input relative w-full resize-none pt-2'
            onFocus={() => handleScrollIntoView()}
          />
        </div>

        <div className='mr-1'>
          <Button
            type='submit'
            disabled={input.length < 5}
            className={` btn ${isSendingMessage ? 'btn-error' : 'btn-accent'}`}
          >
            {isSendingMessage ? (
              // stop icon
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth={1.5}
                stroke='currentColor'
                className='h-6 w-6'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z'
                />
              </svg>
            ) : (
              // plane icon
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth={1.5}
                stroke='currentColor'
                className='h-6 w-6'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5'
                />
              </svg>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}

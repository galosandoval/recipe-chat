import { MyHead } from 'components/Head'
import { SubmitMessageForm } from 'components/SubmitMessageForm'
import ChatWindow from 'components/ChatWindow'
import { useChat } from 'hooks/chatHooks'

export default function PublicChatView() {
  const {
    // recipeFilters,
    input,
    isSendingMessage,
    isChatsModalOpen,
    handleSubmit,
    handleInputChange,

    ...rest
  } = useChat()

  return (
    <>
      <MyHead title='Listy - Chat' />
      <div className='relative flex h-full flex-1 flex-col items-stretch overflow-auto'>
        <div className='flex-1 overflow-hidden'>
          <ChatWindow
            isSendingMessage={isSendingMessage}
            isChatsModalOpen={isChatsModalOpen}
            {...rest}
          />
        </div>
        <SubmitMessageForm
          input={input}
          isSendingMessage={isSendingMessage}
          handleSubmit={handleSubmit}
          handleInputChange={handleInputChange}
        />
      </div>
    </>
  )
}

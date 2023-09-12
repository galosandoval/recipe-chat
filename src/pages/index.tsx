import { MyHead } from 'componentz/head'
import { SubmitMessageForm } from 'componentz/submit-message-form'
import ChatWindow from 'componentz/chat-window'
import { useChat } from 'hooks/chat'

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

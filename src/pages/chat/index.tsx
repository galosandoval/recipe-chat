import { MyHead } from 'componentz/head'
import ChatWindow from 'componentz/chat-window'
import { SubmitMessageForm } from 'componentz/submit-message-form'
import { useChat } from 'hooks/chat'

export default function ChatView() {
  const {
    input,
    isSendingMessage,

    handleInputChange,
    handleSubmit,
    ...rest
  } = useChat()

  return (
    <>
      <MyHead title='Listy - Chat' />
      <div className='relative flex h-full flex-1 flex-col items-stretch overflow-auto'>
        <div className='flex-1 overflow-hidden'>
          <ChatWindow isSendingMessage={isSendingMessage} {...rest} />
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

import { MyHead } from 'components/Head'
import { SubmitMessageForm } from 'components/SubmitMessageForm'
import ChatWindow from 'components/ChatWindow'
import { useChat } from 'hooks/chatHooks'

export default function PublicChatView() {
  const {
    // recipeFilters,
    input,
    isSendingMessage,
    handleFillMessage,
    handleStartNewChat,
    handleToggleChatsModal,
    isChatsModalOpen,
    messages,
    recipeFilters,
    state,
    fetchStatus,
    handleChangeChat,
    handleGetChatsOnSuccess,
    status,

    handleInputChange,
    handleSubmit
  } = useChat()

  return (
    <>
      <MyHead title='Listy - Chat' />
      <div className='relative flex h-full flex-1 flex-col items-stretch overflow-auto'>
        <div className='flex-1 overflow-hidden'>
          <ChatWindow
            isSendingMessage={isSendingMessage}
            handleFillMessage={handleFillMessage}
            handleStartNewChat={handleStartNewChat}
            handleToggleChatsModal={handleToggleChatsModal}
            isChatsModalOpen={isChatsModalOpen}
            messages={messages}
            recipeFilters={recipeFilters}
            state={state}
            fetchStatus={fetchStatus}
            handleChangeChat={handleChangeChat}
            handleGetChatsOnSuccess={handleGetChatsOnSuccess}
            status={status}
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

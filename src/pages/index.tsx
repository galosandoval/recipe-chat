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
    messages,
    recipeFilters,
    chatId,
    fetchStatus,
    status,
    isAuthenticated,
    handleFillMessage,
    handleStartNewChat,
    handleToggleChatsModal,

    handleChangeChat,
    handleGetChatsOnSuccess,
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
            chatId={chatId}
            fetchStatus={fetchStatus}
            handleChangeChat={handleChangeChat}
            handleGetChatsOnSuccess={handleGetChatsOnSuccess}
            status={status}
            isAuthenticated={isAuthenticated}
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

import { MyHead } from 'components/head'
import { SubmitMessageForm } from 'components/submit-message-form'
import ChatWindow from 'components/chat-window'
import { useChat } from 'hooks/useChat'
import { GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export const getStaticProps = (async ({ locale }) => {
  const localeFiles = ['common']

  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', localeFiles))
      // Will be passed to the page component as props
    }
  }
}) satisfies GetStaticProps

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
      <MyHead title='Recipe Chat - Powered By ChatGPT' />
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

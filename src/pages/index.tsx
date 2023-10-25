import { MyHead } from 'components/head'
import { SubmitMessageForm } from 'components/submit-message-form'
import ChatWindow from 'components/chat-window'
import { useChat } from 'hooks/useChat'
import { GetServerSideProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { getServerAuthSession } from './api/auth/[...nextauth]'

export const getServerSideProps = (async ({ locale, req, res }) => {
  const localeFiles = ['common']

  const session = await getServerAuthSession({ req, res })

  if (session) {
    return {
      redirect: {
        destination: '/chat',
        permanent: false
      }
    }
  }

  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', localeFiles))
      // Will be passed to the page component as props
    }
  }
}) satisfies GetServerSideProps

export default function PublicChatView() {
  const {
    input,
    isSendingMessage,
    isChatsModalOpen,
    handleSubmit,
    handleInputChange,

    ...rest
  } = useChat()

  return (
    <>
      <MyHead title='RecipeChat - Powered By ChatGPT' />
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

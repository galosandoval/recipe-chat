import { MyHead } from 'components/head'
import ChatWindow from 'components/chat-window'
import { SubmitMessageForm } from 'components/submit-message-form'
import { useChat } from 'hooks/use-chat'
import { type GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export const getStaticProps = (async ({ locale }) => {
  const localeFiles = ['common']

  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', localeFiles))
    }
  }
}) satisfies GetStaticProps

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
      <MyHead title='RecipeChat - Powered by ChatGPT' />
      <div className='relative flex h-full flex-1 flex-col items-stretch'>
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

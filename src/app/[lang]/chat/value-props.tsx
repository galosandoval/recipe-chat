import { type MouseEvent } from 'react'
import { Button } from '~/components/button'
import { ArrowUTurnLeftIcon } from '~/components/icons'
import { useTranslations } from '~/hooks/use-translations'
import { LoginModal, SignUpModal, useAuthModal } from '~/components/auth-modals'
import { useSession } from 'next-auth/react'
import { chatStore } from '~/stores/chat-store'
import { userMessageDTO } from '~/utils/user-message-dto'

export function ValueProps({ children }: { children: React.ReactNode }) {
  const t = useTranslations()
  const {
    messages,
    streamingStatus,
    reset,
    triggerAISubmission,
    setStreamingStatus
  } = chatStore()
  const isStreaming = streamingStatus !== 'idle'

  const handleFillMessage = (e: MouseEvent<HTMLButtonElement>) => {
    const messageContent = e.currentTarget.innerText

    // Don't allow new messages if already sending
    if (isStreaming) {
      return
    }

    // Reset store for new chat if needed
    if (messages.length === 0) {
      reset()
    }

    setStreamingStatus('streaming')
    // Trigger AI submission
    triggerAISubmission([userMessageDTO(messageContent)])
  }

  return (
    <div className='prose mx-auto flex flex-col items-center justify-center gap-2 pb-20'>
      <div className='flex w-full flex-1 flex-col items-center justify-center'>
        <ValuePropsHeader
          icon={
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
                d='M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z'
              />
            </svg>
          }
          label={t.valueProps.title}
        />

        <div className='flex w-full flex-col items-center gap-4'>
          <Button
            type='submit'
            className='btn btn-outline w-full normal-case'
            onClick={handleFillMessage}
            disabled={isStreaming}
          >
            <span className='whitespace-nowrap'>
              {t.valueProps.firstButton}
            </span>
            <span>
              <ArrowUTurnLeftIcon />
            </span>
          </Button>
          <Button
            type='submit'
            className='btn btn-outline w-full normal-case'
            onClick={handleFillMessage}
            disabled={isStreaming}
          >
            <span>{t.valueProps.secondButton}</span>
            <span>
              <ArrowUTurnLeftIcon />
            </span>
          </Button>
          <Button
            type='submit'
            className='btn btn-outline w-full normal-case'
            onClick={handleFillMessage}
            disabled={isStreaming}
          >
            <span>{t.valueProps.thirdButton}</span>
            <span>
              <ArrowUTurnLeftIcon />
            </span>
          </Button>
        </div>
      </div>

      <div className='flex flex-col items-center justify-center'>
        <ValuePropsHeader
          icon={
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
                d='M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z'
              />
            </svg>
          }
          label={t.capabilities.title}
        />

        <div className='flex w-full flex-col items-center gap-4'>
          <div className='text-base-content mt-0 mb-0 grid h-12 w-full items-center rounded-lg px-5 text-center text-sm font-semibold normal-case'>
            {t.capabilities.firstDescription}
          </div>
          <div className='text-base-content mt-0 mb-0 grid h-12 w-full items-center rounded-lg px-5 text-center text-sm font-semibold normal-case'>
            {t.capabilities.secondDescription}
          </div>
          <div className='text-base-content mt-0 mb-0 grid h-12 w-full items-center rounded-lg px-5 text-center text-sm font-semibold normal-case'>
            {t.capabilities.thirdDescription}
          </div>
        </div>
      </div>

      {children}

      <Auth />
    </div>
  )
}

function Auth() {
  const session = useSession()
  const isAuthenticated = session.status === 'authenticated'

  const t = useTranslations()
  const { handleOpenSignUp, handleOpenLogin } = useAuthModal()

  if (isAuthenticated) {
    return null
  }

  return (
    <>
      <div className='flex w-full flex-col items-center justify-center'>
        <ValuePropsHeader
          icon={
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
                d='M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z'
              />
            </svg>
          }
          label={t.valueProps.saveRecipes}
        />

        <div className='flex w-full flex-col gap-2'>
          <button onClick={handleOpenSignUp} className='btn btn-primary'>
            {t.nav.menu.signUp}
          </button>
          <button onClick={handleOpenLogin} className='btn btn-outline'>
            {t.nav.menu.login}
          </button>
        </div>
      </div>

      <SignUpModal />

      <LoginModal />
    </>
  )
}

export function ValuePropsHeader({
  label,
  icon
}: {
  label: string
  icon: React.ReactNode
}) {
  return (
    <div className='divider'>
      <div className='flex items-center gap-2'>
        <h2 className='mt-2 mb-2'>{label}</h2>
        {icon}
      </div>
    </div>
  )
}

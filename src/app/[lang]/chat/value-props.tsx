import { type MouseEvent } from 'react'
import { useTranslations } from '~/hooks/use-translations'
import {
  LoginModal,
  SignUpModal,
  useAuthModal
} from '~/components/auth/auth-modals'
import { useSession } from 'next-auth/react'
import { chatStore } from '~/stores/chat-store'
import { userMessageDTO } from '~/lib/user-message-dto'
import { Button } from '~/components/ui/button'
import { CookingPot, CornerRightUp } from 'lucide-react'

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
    <div className='mx-auto flex w-full max-w-sm flex-col items-center justify-center gap-2'>
      <div className='flex w-full flex-1 flex-col items-center justify-center pt-20'>
        <ValuePropsHeader icon={<CookingPot />} label={t.valueProps.title} />

        <div className='flex w-full flex-col items-center gap-4 px-4'>
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
              <CornerRightUp />
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
              <CornerRightUp />
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
              <CornerRightUp />
            </span>
          </Button>
        </div>
      </div>

      {/* <div className='flex flex-col items-center justify-center'>
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
      </div> */}

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

        <div className='flex w-full flex-col gap-2 px-4'>
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
  icon,
  actionIcon = null
}: {
  label: string
  icon: React.ReactNode
  actionIcon?: React.ReactNode
}) {
  return (
    <div className='relative w-full px-2'>
      <div className='flex items-center justify-center gap-2 py-2'>
        {icon}
        <h2 className='text-base-content text-xl'>{label}</h2>
      </div>
      <span className='absolute top-2 right-2 ml-auto'>{actionIcon}</span>
    </div>
  )
}

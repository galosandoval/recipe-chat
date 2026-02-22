import { type MouseEvent } from 'react'
import { useTranslations } from '~/hooks/use-translations'
import { SignUpDrawerDialog } from '~/components/auth/auth-drawer-dialogs'
import { useSession } from 'next-auth/react'
import { useChatStore } from '~/stores/chat-store'
import { userMessageDTO } from '~/lib/user-message-dto'
import { Button } from '~/components/button'
import { CornerRightUpIcon, SparklesIcon, UserPlusIcon } from 'lucide-react'
import { cn } from '~/lib/utils'

export function ValueProps({ children }: { children: React.ReactNode }) {
  const t = useTranslations()
  const { messages, reset, triggerAISubmission } = useChatStore()
  const stream = useChatStore((state) => state.stream)
  const isStreaming = !!stream
  const session = useSession()
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

    // Trigger AI submission
    triggerAISubmission([userMessageDTO(messageContent)])
  }

  return (
    <div className='mx-auto flex w-full max-w-sm flex-col items-center justify-center gap-2'>
      <div
        className={cn(
          'flex w-full flex-1 flex-col items-center justify-center pt-20 sm:pt-24',
          !session.data && 'pt-14'
        )}
      >
        <ValuePropsHeader
          icon={<SparklesIcon />}
          label={t.valueProps.title}
          description={t.valueProps.description}
        />

        <div className='flex w-full flex-col items-center gap-4 px-4'>
          <Button
            type='button'
            variant='outline'
            className='w-full'
            onClick={handleFillMessage}
            disabled={isStreaming}
          >
            {t.valueProps.firstButton}
            <CornerRightUpIcon />
          </Button>
          <Button
            type='button'
            variant='outline'
            className='w-full'
            onClick={handleFillMessage}
            disabled={isStreaming}
          >
            <span>{t.valueProps.secondButton}</span>
            <span>
              <CornerRightUpIcon />
            </span>
          </Button>
          <Button
            type='button'
            variant='outline'
            className='w-full'
            onClick={handleFillMessage}
            disabled={isStreaming}
          >
            <span>{t.valueProps.thirdButton}</span>
            <span>
              <CornerRightUpIcon />
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
          <div className='text-foreground mt-0 mb-0 grid h-12 w-full items-center rounded-lg px-5 text-center text-sm font-semibold normal-case'>
            {t.capabilities.firstDescription}
          </div>
          <div className='text-foreground mt-0 mb-0 grid h-12 w-full items-center rounded-lg px-5 text-center text-sm font-semibold normal-case'>
            {t.capabilities.secondDescription}
          </div>
          <div className='text-foreground mt-0 mb-0 grid h-12 w-full items-center rounded-lg px-5 text-center text-sm font-semibold normal-case'>
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

  if (isAuthenticated) {
    return null
  }

  return (
    <>
      <div className='flex w-full flex-col items-center justify-center'>
        <ValuePropsHeader
          description={t.valueProps.createAccountDescription}
          icon={<UserPlusIcon />}
          label={t.valueProps.createAccount}
        />
        <div className='flex w-full flex-col gap-2 px-4'>
          <SignUpDrawerDialog trigger={<Button icon={<UserPlusIcon />}>{t.nav.menu.signUp}</Button>} />
        </div>
      </div>
    </>
  )
}

export function ValuePropsHeader({
  label,
  icon,
  actionIcon = null,
  description
}: {
  label: string
  icon: React.ReactNode
  actionIcon?: React.ReactNode
  description?: string
}) {
  return (
    <>
      <div className='grid w-full grid-cols-3 place-items-center px-2'>
        <span></span>
        <div className='flex items-center justify-center gap-2 py-2'>
          {icon}
          <h2 className='text-foreground text-xl whitespace-nowrap'>{label}</h2>
        </div>
        <span className='ml-auto'>{actionIcon}</span>
      </div>
      {description && (
        <div className='flex flex-col gap-4 px-4 pb-2'>
          <p className='text-muted-foreground text-sm'>{description}</p>
        </div>
      )}
    </>
  )
}

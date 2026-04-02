import { type MouseEvent } from 'react'
import { useTranslations } from '~/hooks/use-translations'
import {
  LoginDrawerDialog,
  SignUpDrawerDialog
} from '~/components/auth/auth-drawer-dialogs'
import { useSession } from 'next-auth/react'
import { useChatStore } from '~/stores/chat-store'
import { userMessageDTO } from '~/lib/user-message-dto'
import { Button } from '~/components/button'
import {
  CornerRightUpIcon,
  PackageIcon,
  SparklesIcon,
  UserPlusIcon,
  UtensilsIcon,
  PencilIcon
} from 'lucide-react'
import { cn } from '~/lib/utils'
import { useChatDrawerStore } from '~/stores/chat-drawer-store'
import { api } from '~/trpc/react'
import Link from 'next/link'
import { buttonVariants } from '~/components/ui/button'

function useContextWelcome() {
  const t = useTranslations()
  const context = useChatDrawerStore((s) => s.context)

  const page = context.page === 'recipe-detail' ? 'recipeDetail' : context.page
  const welcome = t.valueProps.welcome[page]

  const description =
    context.page === 'recipe-detail'
      ? t.valueProps.welcome.recipeDetail.replace(
        'description',
        context.recipe.name
      )
      : welcome.description

  return {
    title: welcome.title,
    description,
    firstButton: welcome.firstButton,
    secondButton: welcome.secondButton,
    thirdButton: welcome.thirdButton
  }
}

export function ValueProps({ children }: { children: React.ReactNode }) {
  const { messages, reset, triggerAISubmission } = useChatStore()
  const isStreaming = useChatStore((state) => state.isStreaming)
  const session = useSession()
  const welcome = useContextWelcome()
  const isAuthenticated = session.status === 'authenticated'

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
          'flex w-full flex-1 flex-col items-center justify-center'
        )}
      >
        <ValuePropsHeader
          icon={<SparklesIcon />}
          label={welcome.title}
          description={welcome.description}
        />

        <div className='flex w-full flex-col items-center gap-4 px-4'>
          <Button
            type='button'
            variant='outline'
            className='w-full'
            onClick={handleFillMessage}
            disabled={isStreaming}
          >
            {welcome.firstButton}
            <CornerRightUpIcon />
          </Button>
          <Button
            type='button'
            variant='outline'
            className='w-full'
            onClick={handleFillMessage}
            disabled={isStreaming}
          >
            <span>{welcome.secondButton}</span>
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
            <span>{welcome.thirdButton}</span>
            <span>
              <CornerRightUpIcon />
            </span>
          </Button>
        </div>
      </div>

      {isAuthenticated && (
        <ContextSources
          isStreaming={isStreaming}
          onFillMessage={handleFillMessage}
        />
      )}

      {children}

      {isAuthenticated && <TasteProfileSummary />}

      <Auth />
    </div>
  )
}

function ContextSources({
  isStreaming,
  onFillMessage
}: {
  isStreaming: boolean
  onFillMessage: (e: MouseEvent<HTMLButtonElement>) => void
}) {
  const t = useTranslations()

  return (
    <div className='flex w-full flex-col pt-2'>
      <ValuePropsHeader icon={<PackageIcon />} label={t.valueProps.useContext} />
      <div className='flex w-full flex-col items-center gap-4 px-4'>
        <Button
          type='button'
          variant='outline'
          className='w-full'
          onClick={onFillMessage}
          disabled={isStreaming}
        >
          <span>{t.valueProps.pantryContext}</span>
          <CornerRightUpIcon />
        </Button>
        <Button
          type='button'
          variant='outline'
          className='w-full'
          onClick={onFillMessage}
          disabled={isStreaming}
        >
          <span>{t.valueProps.savedRecipesContext}</span>
          <CornerRightUpIcon />
        </Button>
      </div>
    </div>
  )
}

function TasteProfileSummary() {
  const t = useTranslations()
  const { data: profile, isLoading } = api.tasteProfile.get.useQuery()

  if (isLoading) return null

  if (!profile) {
    return (
      <div className='flex w-full flex-col pt-2'>
        <ValuePropsHeader icon={<UtensilsIcon />} label={t.valueProps.tasteProfile} />
        <div className='flex flex-col items-center gap-2 px-4'>
          <p className='text-muted-foreground text-sm'>
            {t.valueProps.tasteProfileQuizPrompt}
          </p>
          <Link
            href='/onboarding'
            className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
          >
            {t.valueProps.takeQuiz}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className='flex w-full flex-col pt-2'>
      <ValuePropsHeader icon={<UtensilsIcon />} label={t.valueProps.yourTasteProfile} />
      <div className='flex flex-col gap-1 px-4'>
        <ProfileRow label={t.valueProps.skill} value={profile.cookingSkill} />
        <ProfileRow
          label={t.valueProps.cuisines}
          value={profile.cuisinePreferences.join(', ')}
        />
        {profile.healthGoals.length > 0 && (
          <ProfileRow
            label={t.valueProps.goals}
            value={profile.healthGoals.join(', ')}
          />
        )}
        <ProfileRow
          label={t.valueProps.household}
          value={String(profile.householdSize)}
        />
        <Link
          href='/onboarding'
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'sm' }),
            'mt-1 self-end'
          )}
        >
          <PencilIcon className='h-3 w-3' />
          {t.valueProps.editProfile}
        </Link>
      </div>
    </div>
  )
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex justify-between text-sm'>
      <span className='text-muted-foreground'>{label}</span>
      <span className='text-foreground capitalize'>{value}</span>
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
        <div className='flex w-full flex-col px-4'>
          <SignUpDrawerDialog
            trigger={
              <Button icon={<UserPlusIcon />}>{t.nav.menu.signUp}</Button>
            }
          />
          <LoginDrawerDialog
            trigger={
              <Button variant='link' className='text-foreground text-xs'>
                {t.nav.menu.login}
              </Button>
            }
          />
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

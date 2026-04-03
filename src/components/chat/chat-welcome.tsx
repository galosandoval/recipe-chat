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
import { Toggle } from '~/components/toggle'

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

export function ChatWelcome({ children }: { children: React.ReactNode }) {
  const { messages, reset, triggerAISubmission } = useChatStore()
  const isStreaming = useChatStore((state) => state.isStreaming)
  const session = useSession()
  const welcome = useContextWelcome()
  const isAuthenticated = session.status === 'authenticated'

  const handleFillMessage = (e: MouseEvent<HTMLButtonElement>) => {
    const messageContent = e.currentTarget.innerText

    if (isStreaming) return

    if (messages.length === 0) {
      reset()
    }

    triggerAISubmission([userMessageDTO(messageContent)])
  }

  return (
    <div className='mx-auto flex w-full max-w-sm flex-col items-center justify-center gap-2'>
      <div className='flex w-full flex-1 flex-col items-center justify-center'>
        <SectionHeader
          icon={<SparklesIcon />}
          label={welcome.title}
          description={welcome.description}
        />

        <div className='flex flex-wrap justify-center gap-2 px-4'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='rounded-full'
            onClick={handleFillMessage}
            disabled={isStreaming}
          >
            {welcome.firstButton}
          </Button>
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='rounded-full'
            onClick={handleFillMessage}
            disabled={isStreaming}
          >
            {welcome.secondButton}
          </Button>
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='rounded-full'
            onClick={handleFillMessage}
            disabled={isStreaming}
          >
            {welcome.thirdButton}
          </Button>
        </div>
      </div>

      {isAuthenticated && <ChatOptions />}

      {children}

      {isAuthenticated && <TasteProfileSummary />}

      <Auth />
    </div>
  )
}

function ChatOptions() {
  const t = useTranslations()
  const session = useSession()
  const isAuthenticated = session.status === 'authenticated'
  const userId = session.data?.user?.id ?? ''
  const usePantry = useChatStore((s) => s.usePantry)
  const setUsePantry = useChatStore((s) => s.setUsePantry)

  const { data: pantry, isLoading } = api.pantry.byUserId.useQuery(
    { userId },
    { enabled: isAuthenticated && !!userId }
  )

  if (!isAuthenticated || isLoading) return null
  if ((pantry?.ingredients.length ?? 0) === 0) return null

  return (
    <div className='flex w-full flex-col pt-2'>
      <p className='text-muted-foreground px-4 pb-2 text-xs font-medium uppercase tracking-wide'>
        {t.valueProps.chatOptions}
      </p>
      <div className='px-4'>
        <Toggle
          pressed={usePantry}
          onPressedChange={setUsePantry}
          label={t.valueProps.usePantry}
          id='usePantry'
        />
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
        <SectionHeader icon={<UtensilsIcon />} label={t.valueProps.tasteProfile} />
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

  const editLink = (
    <Link
      href='/onboarding'
      className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
    >
      <PencilIcon className='h-4 w-4' />
    </Link>
  )

  const activeDietary = profile.dietaryRestrictions.filter(
    (r) => r !== 'none'
  )

  return (
    <div className='flex w-full flex-col pt-2'>
      <SectionHeader
        icon={<UtensilsIcon />}
        label={t.valueProps.yourTasteProfile}
        actionIcon={editLink}
      />
      <div className='flex flex-col gap-3 px-4'>
        <ProfileRow label={t.valueProps.skill}>
          <Badge>{profile.cookingSkill}</Badge>
        </ProfileRow>

        <ProfileRow label={t.valueProps.household}>
          <span className='text-foreground text-sm capitalize'>
            {profile.householdSize}
          </span>
        </ProfileRow>

        <ProfileRow label={t.valueProps.cuisines}>
          <div className='flex flex-wrap justify-end gap-1'>
            {profile.cuisinePreferences.map((c) => (
              <Badge key={c}>{c}</Badge>
            ))}
          </div>
        </ProfileRow>

        {activeDietary.length > 0 && (
          <ProfileRow label={t.valueProps.dietary}>
            <div className='flex flex-wrap justify-end gap-1'>
              {activeDietary.map((r) => (
                <Badge key={r}>{r}</Badge>
              ))}
            </div>
          </ProfileRow>
        )}

        {profile.healthGoals.length > 0 && (
          <ProfileRow label={t.valueProps.goals}>
            <div className='flex flex-wrap justify-end gap-1'>
              {profile.healthGoals.map((g) => (
                <Badge key={g}>{g}</Badge>
              ))}
            </div>
          </ProfileRow>
        )}
      </div>
    </div>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className='bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs capitalize'>
      {children}
    </span>
  )
}

function ProfileRow({
  label,
  children
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className='flex items-start justify-between gap-2 text-sm'>
      <span className='text-muted-foreground shrink-0'>{label}</span>
      <div className='flex flex-wrap justify-end gap-1'>{children}</div>
    </div>
  )
}

function Auth() {
  const session = useSession()
  const isAuthenticated = session.status === 'authenticated'
  const t = useTranslations()

  if (isAuthenticated) return null

  return (
    <div className='flex w-full flex-col items-center justify-center'>
      <SectionHeader
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
  )
}

export function SectionHeader({
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
          <h2 className='text-foreground whitespace-nowrap text-xl'>{label}</h2>
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

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
  SparklesIcon,
  UserPlusIcon,
  UtensilsIcon,
  PencilIcon,
  SettingsIcon
} from 'lucide-react'
import { cn } from '~/lib/utils'
import { useChatDrawerStore } from '~/stores/chat-drawer-store'
import { api } from '~/trpc/react'
import Link from 'next/link'
import { buttonVariants } from '~/components/ui/button'
import { Toggle } from '~/components/toggle'
import { FiltersByUser } from './recipe-filters/recipe-filters'
import { SectionHeader } from './section-header'
import { Badge } from '../badge'

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

export function ChatWelcome() {
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
          icon={<SparklesIcon size={16} />}
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

      <FiltersByUser />

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
    <div className='flex w-full flex-col'>
      <SectionHeader
        icon={<SettingsIcon size={16} />}
        label={t.valueProps.chatOptions}
      />
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
        <SectionHeader
          icon={<UtensilsIcon size={16} />}
          label={t.valueProps.tasteProfile}
        />
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
      className={cn(
        buttonVariants({
          variant: 'ghost',
          size: 'sm',
          className: 'text-muted-foreground'
        })
      )}
    >
      <PencilIcon className='h-4 w-4' />
    </Link>
  )

  const activeDietary = profile.dietaryRestrictions.filter((r) => r !== 'none')

  return (
    <div className='flex w-full flex-col pt-2'>
      <SectionHeader
        icon={<UtensilsIcon size={16} />}
        label={t.valueProps.yourTasteProfile}
        actionComp={editLink}
      />
      <div className='flex flex-col gap-3 px-4'>
        <ProfileRow label={t.valueProps.skill}>
          <Badge
            variant='muted'
            labelClassName='text-xs capitalize'
            label={profile.cookingSkill}
          />
        </ProfileRow>

        <ProfileRow label={t.valueProps.household}>
          <span className='text-foreground text-sm capitalize'>
            {profile.householdSize}
          </span>
        </ProfileRow>

        <ProfileRow label={t.valueProps.cuisines}>
          <div className='flex flex-wrap justify-end gap-1'>
            {profile.cuisinePreferences.map((c) => (
              <Badge
                variant='muted'
                labelClassName='text-xs capitalize'
                label={c}
                key={c}
              />
            ))}
          </div>
        </ProfileRow>

        {activeDietary.length > 0 && (
          <ProfileRow label={t.valueProps.dietary}>
            <div className='flex flex-wrap justify-end gap-1'>
              {activeDietary.map((r) => (
                <Badge
                  variant='muted'
                  labelClassName='text-xs capitalize'
                  label={r}
                  key={r}
                />
              ))}
            </div>
          </ProfileRow>
        )}

        {profile.healthGoals.length > 0 && (
          <ProfileRow label={t.valueProps.goals}>
            <div className='flex flex-wrap justify-end gap-1'>
              {profile.healthGoals.map((g) => (
                <Badge
                  variant='muted'
                  labelClassName='text-xs capitalize'
                  label={g}
                  key={g}
                />
              ))}
            </div>
          </ProfileRow>
        )}
      </div>
    </div>
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
        icon={<UserPlusIcon size={16} />}
        label={t.valueProps.createAccount}
      />
      <div className='flex w-full flex-col px-4'>
        <SignUpDrawerDialog
          trigger={<Button icon={<UserPlusIcon />}>{t.nav.menu.signUp}</Button>}
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

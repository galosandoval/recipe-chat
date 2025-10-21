'use client'

import { useSession } from 'next-auth/react'
import { useMemo, useState } from 'react'
import { toast } from '~/components/toast'
import { useTranslations } from '~/hooks/use-translations'
import { api } from '~/trpc/react'
import { cn } from '~/lib/utils'
import { LoginDrawerDialog } from '~/components/auth/auth-drawer-dialogs'
import type { RecipeDTO } from '~/schemas/chats-schema'
import { useRouter } from 'next/navigation'
import { formatTimeFromMinutes } from '~/lib/format-time'
import { Button } from '~/components/button'
import { ChefHat, ChevronDownIcon, ClockIcon, SaveIcon } from 'lucide-react'
import { Card } from '~/components/card'
import { chatStore } from '~/stores/chat-store'

export function CollapsableRecipe({ recipe }: { recipe: RecipeDTO }) {
  const t = useTranslations()
  const [isOpen, setIsOpen] = useState(true)
  const stream = chatStore((state) => state.stream)
  const isStreaming = !!stream

  if (!recipe) {
    return null
  }

  return (
    <Card
      className='mt-3 w-full rounded-md'
      footer={
        <div className='flex w-full justify-between'>
          <Button
            size='sm'
            variant='outline'
            className='mt-2'
            disabled={isStreaming}
            onClick={() => setIsOpen(!isOpen)}
          >
            <ChevronDownIcon
              className={cn('h-4 w-4', isOpen && 'rotate-180')}
            />
            {isOpen ? t.chatWindow.collapse : t.chatWindow.expand}
          </Button>
          <ActionButton
            slug={recipe.slug}
            saved={recipe.saved}
            id={recipe.id}
          />
        </div>
      }
    >
      <div>
        <h3 className='font-semibold'>{recipe.name}</h3>
        <p className='text-xs'>{recipe.description}</p>
        {isOpen && (
          <div className='pt-2'>
            <Times
              prepMinutes={recipe.prepMinutes}
              cookMinutes={recipe.cookMinutes}
            />
            <Ingredients ingredients={recipe.ingredients} />
            <Instructions instructions={recipe.instructions} />
          </div>
        )}
      </div>
    </Card>
  )
}

function ActionButton({
  slug,
  saved,
  id
}: {
  slug: string
  saved: boolean
  id: string
}) {
  const t = useTranslations()
  const router = useRouter()
  const { status } = useSession()
  const isAuthenticated = status === 'authenticated'
  const utils = api.useUtils()
  const isStreaming = !!chatStore((state) => state.stream)
  const isUpsertingMessages = utils.chats.upsert.isMutating()

  const { mutate: saveRecipe, isPending } = api.recipes.save.useMutation({
    async onSuccess(_newRecipe, _messageId) {
      await utils.chats.getMessagesById.invalidate()
      await utils.recipes.infiniteRecipes.invalidate()
      toast.success(t.chatWindow.saveSuccess)
    },
    onError: (error) => {
      if (error.message in t.error) {
        toast.error(
          t.error.error + t.error[error.message as keyof typeof t.error]
        )
      } else {
        toast.error(error.data?.stack ?? error.message)
      }
    }
  })

  const handleSaveRecipe = () => {
    if (!isAuthenticated) {
      toast.info(t.toast.signUp)
      return
    }

    saveRecipe({
      id
    })
  }

  const handleGoToRecipe = () => {
    router.push(`/recipes/${slug}`)
  }

  if (isAuthenticated && !saved) {
    return (
      <Button
        className='mt-2'
        variant='outline'
        size='sm'
        disabled={isStreaming || isUpsertingMessages > 0}
        isLoading={isPending}
        onClick={handleSaveRecipe}
        icon={<SaveIcon className='size-4' />}
      >
        {t.common.save}
      </Button>
    )
  } else if (isAuthenticated && saved) {
    return (
      <Button
        variant='outline'
        className='mt-2'
        disabled={isStreaming || isUpsertingMessages > 0}
        onClick={handleGoToRecipe}
        size='sm'
        icon={<ChefHat className='size-4' />}
      >
        {t.chatWindow.toRecipe}
      </Button>
    )
  } else {
    // Open sign up drawer
    return (
      <LoginDrawerDialog
        trigger={
          <Button className='mt-2' size='sm'>
            {t.common.save}
          </Button>
        }
      />
    )
  }
}

function Times({
  prepMinutes,
  cookMinutes
}: {
  prepMinutes?: number | null
  cookMinutes?: number | null
}) {
  const t = useTranslations()
  const formattedPrepMinutes = useMemo(
    () => (prepMinutes ? formatTimeFromMinutes(prepMinutes, t) : null),
    [prepMinutes]
  )
  const formattedCookMinutes = useMemo(
    () => (cookMinutes ? formatTimeFromMinutes(cookMinutes, t) : null),
    [cookMinutes]
  )
  if (!prepMinutes && !cookMinutes) return null
  return (
    <div className='text-foreground mb-2 flex items-center gap-2 self-center text-sm'>
      <ClockIcon className='size-4' />
      {prepMinutes && (
        <span className='flex items-center gap-2 text-xs'>
          {t.recipes.prepTime} {formattedPrepMinutes}
        </span>
      )}
      {cookMinutes && (
        <span className='flex items-center gap-2 text-xs'>
          {t.recipes.cookTime} {formattedCookMinutes}
        </span>
      )}
    </div>
  )
}

function Ingredients({ ingredients }: { ingredients?: string[] }) {
  const t = useTranslations()

  if (!ingredients || ingredients.length === 0) return null
  return (
    <>
      {ingredients && (
        <h3 className='text-sm font-semibold'>{t.recipes.ingredients}</h3>
      )}
      <ul className='mb-2 list-inside list-disc'>
        {ingredients?.map((i, idx) => (
          <li key={idx + i} className='text-xs'>
            {i}
          </li>
        ))}
      </ul>
    </>
  )
}

function Instructions({ instructions }: { instructions?: string[] }) {
  const t = useTranslations()

  if (!instructions || instructions.length === 0) return null
  return (
    <>
      {instructions && (
        <h3 className='text-sm font-semibold'>{t.recipes.instructions}</h3>
      )}
      <ol className='list-inside list-decimal'>
        {instructions?.map((i, idx) => (
          <li key={idx + i} className='text-xs'>
            {i}
          </li>
        ))}
      </ol>
    </>
  )
}

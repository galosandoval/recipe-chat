'use client'

import { useSession } from 'next-auth/react'
import { useMemo, useState } from 'react'
import { toast } from '~/components/toast'
import { useTranslations } from '~/hooks/use-translations'
import { api } from '~/trpc/react'
import { cn } from '~/lib/utils'
import { useAuthModal } from '~/components/auth/auth-modals'
import type { RecipeDTO } from '~/schemas/chats-schema'
import { useRouter } from 'next/navigation'
import { formatTimeFromMinutes } from '~/lib/format-time'
import { Button } from '~/components/ui/button'
import { ChevronDown, Clock, Save, SquareArrowOutUpRight } from 'lucide-react'

export function CollapsableRecipe({
  recipe,
  isStreaming
}: {
  recipe: RecipeDTO
  isStreaming: boolean
}) {
  const t = useTranslations()
  const [isOpen, setIsOpen] = useState(true)

  if (!recipe) {
    return null
  }

  return (
    <div
      id={recipe.id}
      key={recipe.name}
      className='bg-base-100 mt-3 rounded p-3'
    >
      <div className=''>
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
      <div className='flex justify-between'>
        <Button
          className='btn btn-sm mt-2'
          disabled={isStreaming}
          onClick={() => setIsOpen(!isOpen)}
        >
          <ChevronDown className={cn('h-4 w-4', isOpen && 'rotate-180')} />
          {isOpen ? t.chatWindow.collapse : t.chatWindow.expand}
        </Button>
        <ActionButton
          id={recipe.id}
          saved={recipe.saved}
          isStreaming={isStreaming}
        />
      </div>
    </div>
  )
}

function ActionButton({
  id,
  saved,
  isStreaming
}: {
  id: string
  saved: boolean
  isStreaming: boolean
}) {
  const t = useTranslations()
  const router = useRouter()

  const { handleOpenSignUp } = useAuthModal()
  const { status } = useSession()
  const isAuthenticated = status === 'authenticated'
  const utils = api.useUtils()
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
      handleOpenSignUp()

      toast.info(t.toast.signUp)
      return
    }

    saveRecipe({
      id
    })
  }

  const handleGoToRecipe = () => {
    router.push(`/recipes/${id}`)
  }

  if (isAuthenticated && !saved) {
    return (
      <Button
        className='btn btn-sm mt-2'
        disabled={isStreaming || isUpsertingMessages > 0}
        isLoading={isPending}
        onClick={handleSaveRecipe}
      >
        <Save className='size-4' />
        {t.common.save}
      </Button>
    )
  } else if (isAuthenticated && saved) {
    return (
      <Button className='btn btn-sm mt-2' onClick={handleGoToRecipe}>
        <SquareArrowOutUpRight className='size-4' />
        {t.chatWindow.toRecipe}
      </Button>
    )
  } else {
    return (
      <Button className='btn btn-sm mt-2' onClick={handleOpenSignUp}>
        {t.common.save}
      </Button>
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
    <div className='text-muted-foreground mb-2 flex items-center gap-2 self-center text-sm'>
      <Clock className='size-4' />
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

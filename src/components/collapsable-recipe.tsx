'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslations } from '~/hooks/use-translations'
import type { GeneratedRecipe } from '~/schemas/chats'
import { api } from '~/trpc/react'
import { Button } from './button'
import { ChevronDownIcon, ClockIcon, SaveIcon } from './icons'
import { cn } from '~/utils/cn'
import { useAuthModal } from './auth-modals'
import { infoToastOptions } from './toast'

export function CollaplableRecipe({
  recipe,
  messageId,
  isStreaming
}: {
  recipe: GeneratedRecipe
  messageId?: string
  isStreaming: boolean
}) {
  const t = useTranslations()
  const [isOpen, setIsOpen] = useState(true)
  const { handleOpenSignUp } = useAuthModal()
  const { status } = useSession()
  const isAuthenticated = status === 'authenticated'
  const utils = api.useUtils()

  const { mutate: saveRecipe, isPending } = api.recipes.create.useMutation({
    async onSuccess(_newRecipe, _messageId) {
      await utils.recipes.invalidate()
      // Since the relationship is Recipe -> Message (via messageId),
      // we don't need to update the message object
      // The recipe will be linked to the message via the messageId field

      toast.success(t.chatWindow.saveSuccess)
    },
    onError: (error) => {
      toast.error('Error: ' + error.message)
    }
  })

  if (!recipe) {
    return null
  }

  const handleSaveRecipe = () => {
    if (!isAuthenticated) {
      handleOpenSignUp()

      toast(t.toast.signUp, infoToastOptions)
      return
    }

    if (!recipe?.ingredients || !recipe?.instructions) {
      return
    }

    saveRecipe({
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      name: recipe.name,
      description: recipe.description,
      prepTime: recipe.prepTime ?? undefined,
      cookTime: recipe.cookTime ?? undefined,
      messageId: messageId
    })
  }

  return (
    <div
      id={recipe.name}
      key={recipe.name}
      className='bg-base-100 mt-3 rounded p-3'
    >
      <div className=''>
        <h3 className='font-semibold'>{recipe.name}</h3>
        <p className='text-xs'>{recipe.description}</p>
        {isOpen && (
          <div className='pt-2'>
            <Times prepTime={recipe.prepTime} cookTime={recipe.cookTime} />
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
          <ChevronDownIcon className={cn('h-4 w-4', isOpen && 'rotate-180')} />
          {isOpen ? t.chatWindow.collapse : t.chatWindow.expand}
        </Button>
        {isAuthenticated ? (
          <Button
            className='btn btn-sm mt-2'
            disabled={isStreaming}
            isLoading={isPending}
            onClick={handleSaveRecipe}
          >
            <SaveIcon className='size-4' />
            {t.chatWindow.save}
          </Button>
        ) : // fake save button to show the sign up modal
        null}
      </div>
    </div>
  )
}

function Times({
  prepTime,
  cookTime
}: {
  prepTime?: string | null
  cookTime?: string | null
}) {
  const t = useTranslations()
  if (!prepTime && !cookTime) return null
  return (
    <div className='text-muted-foreground mb-2 flex items-center gap-2 self-center text-sm'>
      <ClockIcon className='size-4' />
      {prepTime !== undefined && (
        <span className='flex items-center gap-2 text-xs'>
          {t.recipes.prepTime} {prepTime}
        </span>
      )}
      {cookTime !== undefined && (
        <span className='flex items-center gap-2 text-xs'>
          {t.recipes.cookTime} {cookTime}
        </span>
      )}
    </div>
  )
}

function Ingredients({ ingredients }: { ingredients?: string[] }) {
  const t = useTranslations()
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
  return (
    <>
      {instructions && (
        <h3 className='text-sm font-semibold'>{t.recipes.instructions}</h3>
      )}
      <ol className='list-inside list-decimal'>
        {instructions?.map((i) => (
          <li key={i} className='text-xs'>
            {i}
          </li>
        ))}
      </ol>
    </>
  )
}

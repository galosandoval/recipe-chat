'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslations } from '~/hooks/use-translations'
import type { GeneratedRecipe } from '~/schemas/chats'
import { api } from '~/trpc/react'
import { Button } from './button'
import { ChevronDownIcon, ClockIcon, PaperPlaneIcon } from './icons'
import { cn } from '~/utils/cn'
import { chatStore } from '~/stores/chat'

export function ChatRecipe({
  recipes,
  messageId
}: {
  recipes: GeneratedRecipe[]
  messageId?: string
}) {
  const t = useTranslations()
  const [isOpen, setIsOpen] = useState(true)
  const { status } = useSession()
  const isAuthenticated = status === 'authenticated'
  const { mutate: saveRecipe, isPending } = api.recipes.create.useMutation({
    onSuccess: () => {
      toast.success(t.chatWindow.saveSuccess)
    }
  })
  const recipe = recipes?.[0]
  if (!recipe || recipes.length !== 1) {
    return null
  }

  const handleSaveRecipe = () => {
    if (!recipe?.ingredients || !recipe?.instructions) {
      return
    }
    // saveRecipe({
    // 	id: recipe.id
    // })
  }

  return (
    <div key={recipe.name} className='bg-base-100 card mt-2'>
      <div>
        <h3 className='card-title'>{recipe.name}</h3>
        <p className=''>{recipe.description}</p>
        {isOpen && (
          <div className='card-body p-0'>
            <Times prepTime={recipe.prepTime} cookTime={recipe.cookTime} />
            <Ingredients ingredients={recipe.ingredients} />
            <Instructions instructions={recipe.instructions} />
          </div>
        )}
      </div>
      <div className='card-actions flex justify-between'>
        <Button onClick={() => setIsOpen(!isOpen)}>
          <ChevronDownIcon className={cn('h-5 w-5', isOpen && 'rotate-180')} />
          {isOpen ? t.chatWindow.collapse : t.chatWindow.expand}
        </Button>
        {/*
        {isAuthenticated ? (
          <SaveButton handleSaveRecipe={handleSaveRecipe} isLoading={isPending}>
            {t.chatWindow.save}
          </SaveButton>
        ) : (
          // fake save button to show the sign up modal
          <SignUpModalTrigger>
            <Save className='h-5 w-5' />
            {t.chatWindow.save}
          </SignUpModalTrigger>
        )} */}
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
  return (
    <div className='text-muted-foreground mb-2 flex items-center gap-2 self-center text-sm'>
      <ClockIcon className='size-4' />
      {prepTime !== undefined && (
        <span className='flex items-center gap-2'>
          {t.recipes.prepTime} {prepTime}
        </span>
      )}
      {cookTime !== undefined && (
        <span className='flex items-center gap-2'>
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
      {ingredients && <h3 className='text-base'>{t.recipes.ingredients}</h3>}
      <ul className='mb-2 list-inside list-disc'>
        {ingredients?.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </>
  )
}

function Instructions({ instructions }: { instructions?: string[] }) {
  const t = useTranslations()
  return (
    <>
      {instructions && <h3 className='text-base'>{t.recipes.instructions}</h3>}
      <ol className='list-inside list-decimal'>
        {instructions?.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ol>
    </>
  )
}

// function RecipesToGenerate({ recipes }: { recipes: Message['recipes'] }) {
function RecipesToGenerate() {
  const t = useTranslations()
  // const [generated, setGenerated] = useState<boolean[]>(
  // 	recipes?.map(() => false) ?? []
  // )
  const { triggerAISubmission, isStreaming } = chatStore()
  const { status } = useSession()
  const isAuthenticated = status === 'authenticated'

  // if (!recipes || recipes.length === 0 || recipes.length === 1) {
  // 	return null
  // }

  const generateRecipe = async (
    name: string,
    description: string,
    index: number
  ) => {
    // onChatFormSubmit({
    // 	prompt: `Generate a recipe for ${name}: ${description}`
    // })
    // setGenerated((state) => {
    // 	const newState = [...state]
    // 	newState[index] = true
    // 	return newState
    // })
  }

  return (
    <div className='grid grid-cols-1 items-stretch gap-2 pt-2 sm:grid-cols-2'>
      {/* {recipes.map((r, i) => (
				<Card key={r.name + i} className='bg-background'>
					<CardHeader className='p-3'>
						<CardTitle>{r.name}</CardTitle>
						<CardDescription>{r.description}</CardDescription>
					</CardHeader>

					<div className='flex'>
						{generated[i] ? (
							isAuthenticated ? (
								<Button
									className='w-full'
									// onClick={() => handleSaveRecipe(r)}
								>
									<Save />
									{t.chatWindow.save}
								</Button>
							) : (
								// fake save button to show the sign up modal
								<SignUpModalTrigger>
									<Save />
									{t.chatWindow.save}
								</SignUpModalTrigger>
							)
						) : (
							<GenerateButton
								disabled={isStreaming}
								onClick={() =>
									generateRecipe(
										r.name,
										r.description ?? '',
										i
									)
								}
							/>
						)}
					</div>
				</Card>
			))} */}
    </div>
  )
}

function GenerateButton({
  disabled,
  onClick
}: {
  disabled: boolean
  onClick: () => Promise<void>
}) {
  const t = useTranslations()

  const handleGenerate = async () => {
    await onClick()
  }

  return (
    <Button className='w-full' disabled={disabled} onClick={handleGenerate}>
      <PaperPlaneIcon />
      {t.chatWindow.generate}
    </Button>
  )
}

import { useTranslations } from '~/hooks/use-translations'
import { chatStore } from '~/stores/chat-store'
import type { RecipeDTO } from '~/schemas/chats-schema'
import { userMessageDTO } from '~/lib/user-message-dto'
import { buildGenerateRecipeContent } from '~/lib/build-generate-recipe-content'
import { Button } from '~/components/button'
import { Card } from '~/components/card'
import { useEffect, useRef } from 'react'
import { STREAM_TIMEOUT } from '~/constants/chat'
import { SendIcon } from 'lucide-react'

export function RecipesToGenerate({ recipes }: { recipes: RecipeDTO[] }) {
  const isStreaming = !!chatStore((state) => state.stream)

  return (
    <div className='grid grid-cols-1 items-stretch gap-2 pt-3 sm:grid-cols-2'>
      {recipes.map((r, i) => (
        <Recipe key={r.name + i} recipe={r} isStreaming={isStreaming} />
      ))}
    </div>
  )
}

function Recipe({
  recipe,
  isStreaming
}: {
  recipe: RecipeDTO
  isStreaming: boolean
}) {
  const shouldShowGenerateButton =
    recipe.ingredients?.length === 0 && recipe.instructions?.length === 0

  return (
    <Card className='bg-background'>
      <h3 className='text-secondary-foreground font-semibold'>{recipe.name}</h3>
      <p className='text-xs'>{recipe.description}</p>
      <div className='flex justify-end pt-2'>
        {shouldShowGenerateButton && (
          <GenerateButton
            disabled={isStreaming}
            recipeName={recipe.name}
            recipeDescription={recipe.description ?? ''}
          />
        )}
      </div>
    </Card>
  )
}

function GenerateButton({
  disabled,
  recipeName,
  recipeDescription
}: {
  disabled: boolean
  recipeName: string
  recipeDescription: string
}) {
  const t = useTranslations()
  const { triggerAISubmission, messages, setStream } = chatStore()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const generateRecipe = async (name: string, description: string) => {
    triggerAISubmission([
      ...messages,
      userMessageDTO(
        buildGenerateRecipeContent(
          t.chatWindow.generateRecipe,
          name,
          description
        ),
        chatStore.getState().chatId
      )
    ])
    timeoutRef.current = setTimeout(() => {
      setStream(null)
      timeoutRef.current = null
    }, STREAM_TIMEOUT)
  }
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [])
  const handleGenerate = async () => {
    await generateRecipe(recipeName, recipeDescription)
  }
  return (
    <Button
      size='sm'
      disabled={disabled}
      onClick={handleGenerate}
      variant='outline'
    >
      <SendIcon className='size-4' />
      {t.chatWindow.generate}
    </Button>
  )
}

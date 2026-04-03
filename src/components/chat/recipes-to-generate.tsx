import { useTranslations } from '~/hooks/use-translations'
import { useChatStore } from '~/stores/chat-store'
import type { RecipeDTO } from '~/schemas/chats-schema'
import { userMessageDTO } from '~/lib/user-message-dto'
import { buildGenerateRecipeContent } from '~/lib/build-generate-recipe-content'
import { Button } from '~/components/button'
import { Card } from '~/components/card'
import { useEffect, useRef } from 'react'
import { STREAM_TIMEOUT } from '~/constants/chat'
import { SendIcon } from 'lucide-react'

export function RecipesToGenerate({ recipes }: { recipes: RecipeDTO[] }) {
  const isStreaming = useChatStore((state) => state.isStreaming)
  const storeMessages = useChatStore((state) => state.messages)

  const generatedRecipeNames = new Set<string>()
  for (const msg of storeMessages) {
    if (msg.recipes.length === 1) {
      generatedRecipeNames.add(msg.recipes[0].name)
    }
  }

  return (
    <div className='grid grid-cols-1 items-stretch gap-2 pt-3 sm:grid-cols-2'>
      {recipes.map((r, i) => (
        <Recipe
          key={r.name + i}
          recipe={r}
          isStreaming={isStreaming}
          isGenerated={generatedRecipeNames.has(r.name)}
        />
      ))}
    </div>
  )
}

function Recipe({
  recipe,
  isStreaming,
  isGenerated
}: {
  recipe: RecipeDTO
  isStreaming: boolean
  isGenerated: boolean
}) {
  return (
    <Card className='bg-background'>
      <h3 className='text-secondary-foreground font-semibold'>{recipe.name}</h3>
      <p className='text-xs'>{recipe.description}</p>
      {!isGenerated && (
        <div className='flex justify-end pt-2'>
          <GenerateButton
            disabled={isStreaming}
            recipeName={recipe.name}
            recipeDescription={recipe.description ?? ''}
          />
        </div>
      )}
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
  const { triggerAISubmission, messages, setIsStreaming } = useChatStore()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const generateRecipe = async (name: string, description: string) => {
    setIsStreaming(true)
    triggerAISubmission([
      ...messages,
      userMessageDTO(
        buildGenerateRecipeContent(t.chat.generateRecipe, name, description),
        useChatStore.getState().chatId
      )
    ])
    timeoutRef.current = setTimeout(() => {
      setIsStreaming(false)
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
      {t.chat.generate}
    </Button>
  )
}

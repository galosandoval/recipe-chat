import { useTranslations } from '~/hooks/use-translations'
import { useChatStore } from '~/stores/chat-store'
import type { RecipeDTO } from '~/schemas/chats-schema'
import { userMessageDTO } from '~/lib/user-message-dto'
import { buildGenerateRecipeContent } from '~/lib/build-generate-recipe-content'
import { Button } from '~/components/button'
import { Card } from '~/components/card'
import { NavigationButton } from '~/components/navigation-button'
import { useEffect, useRef, useState } from 'react'
import { SIMILAR_RECIPE_THRESHOLD, STREAM_TIMEOUT } from '~/constants/chat'
import { SendIcon } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { api } from '~/trpc/react'
import { pickSimilarMatch } from './pick-similar-match'

export function RecipesToGenerate({ recipes }: { recipes: RecipeDTO[] }) {
  const isStreaming = useChatStore((state) => state.isStreaming)
  const storeMessages = useChatStore((state) => state.messages)

  const generatedRecipeNames = new Set<string>()
  for (const msg of storeMessages) {
    if (msg.recipes.length === 1) {
      generatedRecipeNames.add(msg.recipes[0].name)
    }
  }

  // This turn's suggestions are persisted + embedded, so a similarity search can
  // return one of them. Exclude them all by id so we never surface a suggestion
  // as its own (or a sibling's) "you already have this" match.
  const currentTurnIds = new Set(recipes.map((r) => r.id))

  return (
    <div className='grid grid-cols-1 items-stretch gap-2 pt-3 sm:grid-cols-2'>
      {recipes.map((r, i) => (
        <Recipe
          key={r.name + i}
          recipe={r}
          isStreaming={isStreaming}
          isGenerated={generatedRecipeNames.has(r.name)}
          excludeIds={currentTurnIds}
        />
      ))}
    </div>
  )
}

function Recipe({
  recipe,
  isStreaming,
  isGenerated,
  excludeIds
}: {
  recipe: RecipeDTO
  isStreaming: boolean
  isGenerated: boolean
  excludeIds: Set<string>
}) {
  return (
    <Card className='bg-background'>
      <h3 className='text-secondary-foreground font-semibold'>{recipe.name}</h3>
      <p className='text-xs'>{recipe.description}</p>
      <SimilarRecipe
        suggestionName={recipe.name}
        isStreaming={isStreaming}
        excludeIds={excludeIds}
      />
      {!isGenerated && (
        <div className='flex justify-end pt-2'>
          <GenerateButton
            disabled={isStreaming}
            recipeId={recipe.id}
            recipeName={recipe.name}
            recipeDescription={recipe.description ?? ''}
          />
        </div>
      )}
    </Card>
  )
}

function SimilarRecipe({
  suggestionName,
  isStreaming,
  excludeIds
}: {
  suggestionName: string
  isStreaming: boolean
  excludeIds: Set<string>
}) {
  const t = useTranslations()
  const { status } = useSession()
  const isAuthenticated = status === 'authenticated'

  // Non-blocking: errors surface as undefined data and render nothing; a failed
  // search never prevents the suggestion from rendering.
  const { data } = api.recipes.searchSimilar.useQuery(
    { query: suggestionName, limit: 3 },
    { enabled: isAuthenticated && !isStreaming, retry: false }
  )

  const match = pickSimilarMatch(data, excludeIds, SIMILAR_RECIPE_THRESHOLD)
  if (!match) return null

  return (
    <NavigationButton
      href={`/recipes/${match.slug}`}
      className='text-primary mt-1 text-left text-xs underline underline-offset-2'
    >
      {t.chat.alreadyHave}: {match.name}
    </NavigationButton>
  )
}

function GenerateButton({
  disabled,
  recipeId,
  recipeName,
  recipeDescription
}: {
  disabled: boolean
  recipeId: string
  recipeName: string
  recipeDescription: string
}) {
  const t = useTranslations()
  const { triggerAISubmission, messages, setIsStreaming } = useChatStore()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const generateRecipe = async (name: string, description: string) => {
    setIsStreaming(true)
    useChatStore.getState().setPendingExpandRecipeId(recipeId)
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
    setIsLoading(true)
    await generateRecipe(recipeName, recipeDescription)
  }
  return (
    <Button
      size='sm'
      disabled={disabled}
      isLoading={disabled && isLoading}
      onClick={handleGenerate}
      variant='outline'
      icon={<SendIcon className='size-4' />}
    >
      {t.chat.generate}
    </Button>
  )
}

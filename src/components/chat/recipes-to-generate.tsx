import { useTranslations } from '~/hooks/use-translations'
import { useChatStore } from './chat-store'
import { useChatSessionContext } from './use-chat-session'
import type { RecipeDTO } from '~/schemas/chats-schema'
import { Button } from '~/components/button'
import { RecipeOptionCard } from './recipe-option-card'
import { useState } from 'react'
import { SendIcon } from 'lucide-react'

export function RecipesToGenerate({ recipes }: { recipes: RecipeDTO[] }) {
  const { isStreaming } = useChatSessionContext()
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
    <RecipeOptionCard
      name={recipe.name}
      description={recipe.description}
      action={
        !isGenerated && (
          <GenerateButton
            disabled={isStreaming}
            recipeId={recipe.id}
            recipeName={recipe.name}
            recipeDescription={recipe.description ?? ''}
          />
        )
      }
    />
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
  const { generateRecipe } = useChatSessionContext()
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = () => {
    setIsLoading(true)
    generateRecipe(recipeId, recipeName, recipeDescription)
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

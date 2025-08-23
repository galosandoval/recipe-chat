import { useTranslations } from '~/hooks/use-translations'
import { chatStore } from '~/stores/chat-store'
import type { RecipeDTO } from '~/schemas/chats'
import { Button } from './button'
import { PaperPlaneIcon } from './icons'
import { userMessageDTO } from '~/utils/user-message-dto'
import { buildGenerateRecipeContent } from '~/utils/build-generate-recipe-content'

export function RecipesToGenerate({
  recipes,
  isStreaming
}: {
  recipes: RecipeDTO[]
  isStreaming: boolean
}) {
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
    <div className='bg-base-100 rounded p-2'>
      <h3 className='font-semibold'>{recipe.name}</h3>
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
    </div>
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
  const { triggerAISubmission, messages, setStreamingStatus } = chatStore()

  const generateRecipe = async (name: string, description: string) => {
    setStreamingStatus('generating')
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
  }
  const handleGenerate = async () => {
    await generateRecipe(recipeName, recipeDescription)
  }
  return (
    <Button className='btn-sm btn' disabled={disabled} onClick={handleGenerate}>
      <PaperPlaneIcon className='size-4' />
      {t.chatWindow.generate}
    </Button>
  )
}

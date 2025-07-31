import { useTranslations } from '~/hooks/use-translations'
import { chatStore } from '~/stores/chat-store'
import type { RecipeDTO } from '~/schemas/chats'
import { Button } from './button'
import { PaperPlaneIcon } from './icons'
import { userMessageDTO } from '~/utils/use-message-dto'

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
  const { triggerAISubmission, messages } = chatStore()
  const t = useTranslations()

  const generateRecipe = async (name: string, description: string) => {
    triggerAISubmission([
      ...messages,
      userMessageDTO(
        t.chatWindow.generateRecipe + name + ': ' + description,
        chatStore.getState().chatId
      )
    ])
  }
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
            onClick={() =>
              generateRecipe(recipe.name, recipe.description ?? '')
            }
          />
        )}
      </div>
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
    <Button className='btn-sm btn' disabled={disabled} onClick={handleGenerate}>
      <PaperPlaneIcon className='size-4' />
      {t.chatWindow.generate}
    </Button>
  )
}

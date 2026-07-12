'use client'

import { useRecipe } from '~/hooks/use-recipe'
import { getIngredientDisplayText } from '~/lib/ingredient-display'
import { ChatFab, ChatPanel } from '~/components/chat-panel'
import type { ChatContext } from '~/schemas/chats-schema'

export function RecipeDetailChat() {
  const { data: recipe } = useRecipe()

  const context: ChatContext = !recipe
    ? { page: 'recipes' }
    : {
        page: 'recipe-detail',
        recipe: {
          id: recipe.id,
          name: recipe.name,
          slug: recipe.slug,
          description: recipe.description,
          ingredients: recipe.ingredients.map((ing) =>
            getIngredientDisplayText(ing)
          ),
          cuisine: recipe.cuisine,
          course: recipe.course
        }
      }

  return (
    <>
      <ChatFab className='bottom-4' context={context} />
      <ChatPanel />
    </>
  )
}

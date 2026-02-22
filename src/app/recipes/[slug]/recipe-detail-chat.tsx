'use client'

import { useMemo } from 'react'
import { useRecipe } from '~/hooks/use-recipe'
import { getIngredientDisplayText } from '~/lib/ingredient-display'
import { ChatFab, ChatPanel } from '~/components/chat-panel'
import type { ChatContext } from '~/schemas/chats-schema'

export function RecipeDetailChat() {
  const { data: recipe } = useRecipe()

  const context = useMemo((): ChatContext => {
    if (!recipe) return { page: 'recipes' }
    return {
      page: 'recipe-detail',
      recipe: {
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
  }, [recipe])

  return (
    <>
      <ChatFab context={context} />
      <ChatPanel />
    </>
  )
}

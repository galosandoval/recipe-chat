'use client'

import { BotMessageSquareIcon } from 'lucide-react'
import type { GeneratedMessage } from '~/schemas/chats-schema'
import { CollapsableRecipe } from './collapsable-recipe'
import { RecipesToGenerate } from './recipes-to-generate'
import { ChatMessage } from './message'

export function Stream({ stream }: { stream: GeneratedMessage }) {
  if (!stream.content) return null

  const isRenderingOneRecipe = stream.recipes?.length === 1
  const isRenderingRecipes = stream.recipes?.length > 1

  const recipe = stream.recipes?.[0]
  const recipes = stream.recipes

  return (
    <div className='flex flex-col'>
      <div className='mx-auto w-full'>
        <ChatMessage content={stream.content} icon={<BotMessageSquareIcon />}>
          <>
            {isRenderingOneRecipe && (
              <CollapsableRecipe
                recipe={{
                  ...recipe,
                  id: '',
                  saved: false,
                  prepMinutes: recipe.prepMinutes ?? null,
                  cookMinutes: recipe.cookMinutes ?? null,
                  ingredients: recipe.ingredients ?? [],
                  instructions: recipe.instructions ?? [],
                  cuisine: recipe.cuisine ?? null,
                  course: recipe.course ?? null,
                  dietTags: recipe.dietTags ?? [],
                  flavorTags: recipe.flavorTags ?? [],
                  mainIngredients: recipe.mainIngredients ?? [],
                  techniques: recipe.techniques ?? [],
                  slug: ''
                }}
              />
            )}
            {isRenderingRecipes && (
              <RecipesToGenerate
                recipes={recipes.map((r) => ({
                  ...r,
                  id: '',
                  saved: false,
                  prepMinutes: r.prepMinutes ?? null,
                  cookMinutes: r.cookMinutes ?? null,
                  ingredients: r.ingredients ?? [],
                  instructions: r.instructions ?? [],
                  cuisine: r.cuisine ?? null,
                  course: r.course ?? null,
                  dietTags: r.dietTags ?? [],
                  flavorTags: r.flavorTags ?? [],
                  mainIngredients: r.mainIngredients ?? [],
                  techniques: r.techniques ?? [],
                  slug: ''
                }))}
              />
            )}
          </>
        </ChatMessage>
      </div>
    </div>
  )
}

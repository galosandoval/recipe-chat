'use client'

import { BotMessageSquareIcon } from 'lucide-react'
import type { GeneratedMessage } from '~/schemas/chats-schema'
import type { FullRecipe } from '~/schemas/messages-schema'
import { toRecipeDTOs } from './recipe-dto'
import { CollapsableRecipe } from './collapsable-recipe'
import { RecipesToGenerate } from './recipes-to-generate'
import { ChatMessage } from './message'

export function Stream({ stream }: { stream: GeneratedMessage }) {
  if (!stream.content) return null

  const isRenderingOneRecipe = stream.recipes?.length === 1
  const isRenderingRecipes = stream.recipes?.length > 1

  const recipe = stream.recipes?.[0] as FullRecipe | undefined
  const recipes = (stream.recipes ?? []) as FullRecipe[]

  // Mid-stream cards aren't persisted yet, so they render with empty id/slug.
  const [oneRecipe] = recipe
    ? toRecipeDTOs([recipe], { kind: 'placeholder' })
    : []
  const recipeDTOs = toRecipeDTOs(recipes, { kind: 'placeholder' })

  return (
    <div className='flex flex-col'>
      <div className='mx-auto w-full'>
        <ChatMessage content={stream.content} icon={<BotMessageSquareIcon />}>
          <>
            {isRenderingOneRecipe && oneRecipe && (
              <CollapsableRecipe recipe={oneRecipe} />
            )}
            {isRenderingRecipes && <RecipesToGenerate recipes={recipeDTOs} />}
          </>
        </ChatMessage>
      </div>
    </div>
  )
}

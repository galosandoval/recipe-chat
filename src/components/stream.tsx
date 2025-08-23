'use client'

import { UserCircleIcon } from './icons'
import type { GeneratedMessage } from '~/schemas/chats'
import { CollapsableRecipe } from './collapsable-recipe'
import { RecipesToGenerate } from './recipes-to-generate'

export function Stream({
  stream,
  isStreaming
}: {
  stream: GeneratedMessage
  isStreaming: boolean
}) {
  if (!isStreaming || !stream.content) return null

  return (
    <div className='flex flex-col'>
      <div className='mx-auto w-full'>
        <div className='flex w-full justify-start gap-2 self-center'>
          <div>
            <UserCircleIcon />
          </div>

          <div className='bg-base-300 flex flex-col rounded p-3 pb-4'>
            <p className='text-sm whitespace-pre-line'>{stream.content}</p>
            {stream.recipes?.length === 1 && (
              <CollapsableRecipe
                recipe={{
                  ...stream.recipes[0],
                  id: '',
                  saved: false,
                  prepMinutes: stream.recipes[0].prepMinutes ?? null,
                  cookMinutes: stream.recipes[0].cookMinutes ?? null,
                  ingredients: stream.recipes[0].ingredients ?? [],
                  instructions: stream.recipes[0].instructions ?? [],
                  cuisine: stream.recipes[0].cuisine ?? null,
                  course: stream.recipes[0].course ?? null,
                  dietTags: stream.recipes[0].dietTags ?? [],
                  flavorTags: stream.recipes[0].flavorTags ?? [],
                  mainIngredients: stream.recipes[0].mainIngredients ?? [],
                  techniques: stream.recipes[0].techniques ?? []
                }}
                isStreaming={isStreaming}
              />
            )}
            {stream.recipes && stream.recipes?.length > 1 && (
              <RecipesToGenerate
                recipes={stream.recipes.map((r) => ({
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
                  techniques: r.techniques ?? []
                }))}
                isStreaming={isStreaming}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

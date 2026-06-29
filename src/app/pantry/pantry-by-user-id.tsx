'use client'

import { type ReactNode } from 'react'
import type { Ingredient } from '@prisma/client'
import { useTranslations } from '~/hooks/use-translations'
import { api } from '~/trpc/react'
import { useUserId } from '~/hooks/use-user-id'
import { ArrowDownIcon, MessageSquareIcon } from 'lucide-react'
import {
  IngredientItemDisplay,
  getIngredientItemDisplay
} from '~/components/ingredient-item-display'
import { ingredientStringToCreatePayload } from '~/lib/parse-ingredient'
import { BulkAddPantry } from './bulk-add-pantry'
import { ManagePantryDialog } from './manage-pantry-dialog'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { Button } from '~/components/button'
import { toast } from '~/components/toast'

function usePantryData() {
  const userId = useUserId()
  return api.pantry.byUserId.useSuspenseQuery({ userId })
}

export function useAddToPantry() {
  const userId = useUserId()
  const utils = api.useUtils()
  return api.pantry.add.useMutation({
    onMutate: async (input) => {
      await utils.pantry.byUserId.cancel({ userId })
      const prev = utils.pantry.byUserId.getData({ userId })
      if (!prev) return { prev }
      const optimistic: Ingredient = {
        id: input.id,
        recipeId: null,
        listId: null,
        pantryId: prev.id,
        checked: false,
        quantity: null,
        unit: null,
        unitType: null,
        itemName: null,
        preparation: null,
        rawString: input.rawLine
      }
      utils.pantry.byUserId.setData(
        { userId },
        {
          ...prev,
          ingredients: [...prev.ingredients, optimistic]
        }
      )
      return { prev }
    },
    onSuccess: () => utils.pantry.byUserId.invalidate({ userId }),
    onError: (error, _, ctx) => {
      if (ctx?.prev) utils.pantry.byUserId.setData({ userId }, ctx.prev)
      toast.error(error.message)
    }
  })
}

export function PantryByUserId() {
  const [pantry] = usePantryData()
  const { data: user } = api.users.get.useQuery()
  const ingredients = pantry?.ingredients ?? []
  const preferredWeight = user?.preferredWeightUnit ?? null
  const preferredVolume = user?.preferredVolumeUnit ?? null
  const { variables: addVariables } = useAddToPantry()

  if (ingredients.length === 0) {
    return (
      <EmptyPantry>
        <BulkAddPantry />
      </EmptyPantry>
    )
  }

  return (
    <div className='mx-2 flex flex-col gap-4'>
      <div className='flex flex-wrap items-center gap-2'>
        <BulkAddPantry />
        <ManagePantryDialog
          ingredients={ingredients}
          preferredWeightUnit={preferredWeight}
          preferredVolumeUnit={preferredVolume}
        />
      </div>
      <PantryList
        ingredients={ingredients}
        preferredWeightUnit={preferredWeight}
        preferredVolumeUnit={preferredVolume}
        pendingAddVariables={addVariables}
      />
    </div>
  )
}

/**
 * Read-only pantry list. Rows mirror the List page's ingredient display
 * (quantity + unit badge + name); all editing happens in {@link ManagePantryDialog}.
 */
function PantryList({
  ingredients,
  preferredWeightUnit,
  preferredVolumeUnit,
  pendingAddVariables
}: {
  ingredients: Ingredient[]
  preferredWeightUnit?: string | null
  preferredVolumeUnit?: string | null
  pendingAddVariables?: { rawLine: string; id: string } | undefined
}) {
  const getDisplayIngredient = (ing: Ingredient): Ingredient => {
    if (
      pendingAddVariables?.id === ing.id &&
      pendingAddVariables?.rawLine &&
      (ing.quantity == null || ing.unit == null)
    ) {
      const parsed = ingredientStringToCreatePayload(
        pendingAddVariables.rawLine
      )
      return {
        ...ing,
        quantity: parsed.quantity,
        unit: parsed.unit,
        unitType: parsed.unitType,
        itemName: parsed.itemName,
        preparation: parsed.preparation
      }
    }
    return ing
  }
  const displayText = (ing: Ingredient) =>
    getIngredientItemDisplay(
      getDisplayIngredient(ing),
      preferredWeightUnit,
      preferredVolumeUnit
    ).displayText
  const sorted = [...ingredients].sort((a, b) =>
    displayText(a).localeCompare(displayText(b))
  )

  return (
    <ul className='flex flex-col gap-2'>
      {sorted.map((ing) => (
        <li
          key={ing.id}
          className='text-foreground border-muted/50 bg-muted/20 flex items-center rounded-md border px-3 py-2'
        >
          <IngredientItemDisplay
            ingredient={getDisplayIngredient(ing)}
            preferredWeightUnit={preferredWeightUnit}
            preferredVolumeUnit={preferredVolumeUnit}
          />
        </li>
      ))}
    </ul>
  )
}

function EmptyPantry({ children }: { children: ReactNode }) {
  const t = useTranslations()

  return (
    <div className='flex min-h-full flex-col items-center justify-center gap-4 px-4'>
      <h1 className='text-foreground text-center text-2xl font-bold'>
        {t.pantry.noItems}
      </h1>
      <Alert className='mx-4'>
        <AlertTitle>{t.pantry.noItems}</AlertTitle>
        <AlertDescription>{t.pantry.emptyAlert}</AlertDescription>
      </Alert>
      <div className='flex w-full justify-center'>{children}</div>
      <p className='text-foreground text-center text-sm'>{t.pantry.addItem}</p>
      <Button variant='outline' size='sm' className='mt-1' disabled>
        <MessageSquareIcon className='size-4' />
        {t.pantry.useInChat}
      </Button>
      <div className='text-primary animate-bounce'>
        <ArrowDownIcon className='size-4' />
      </div>
    </div>
  )
}

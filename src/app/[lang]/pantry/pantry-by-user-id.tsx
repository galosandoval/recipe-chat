'use client'

import React, { type ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import type { Ingredient } from '@prisma/client'
import { useTranslations } from '~/hooks/use-translations'
import { useChatPanelStore } from '~/stores/chat-panel-store'
import { chatStore } from '~/stores/chat-store'
import { api } from '~/trpc/react'
import { useUserId } from '~/hooks/use-user-id'
import { ArrowDownIcon, MessageSquareIcon, MinusIcon, PencilIcon, PlusIcon } from 'lucide-react'
import { useAppForm } from '~/hooks/use-app-form'
import z from 'zod'
import {
  getIngredientDisplayText,
  getIngredientDisplayTextInPreferredUnits,
  getIngredientDisplayQuantityAndUnit
} from '~/lib/ingredient-display'
import { ingredientStringToCreatePayload } from '~/lib/parse-ingredient'
import { BulkAddPantry } from './bulk-add-pantry'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { Badge as BadgeUI } from '~/components/ui/badge'
import { Button } from '~/components/button'
import { toast } from '~/components/toast'
import { DrawerDialog } from '~/components/drawer-dialog'
import { Form } from '~/components/form/form'
import { FormInput } from '~/components/form/form-input'
import { Input } from '~/components/ui/input'

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
      utils.pantry.byUserId.setData({ userId }, {
        ...prev,
        ingredients: [...prev.ingredients, optimistic]
      })
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
        <UseInChatButton />
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

const QUANTITY_STEP_COUNT = 1
const QUANTITY_STEP_WEIGHT_VOLUME = 0.25
const MIN_WEIGHT_VOLUME = 0.25

const DEBOUNCE_MS = 400

function PantryRow({
  ingredient,
  displayIngredient,
  preferredWeightUnit,
  preferredVolumeUnit,
  displayText,
  onEdit,
  onDelete,
  updateItem,
  optimisticUpdateQuantity
}: {
  ingredient: Ingredient
  displayIngredient: Ingredient
  preferredWeightUnit?: string | null
  preferredVolumeUnit?: string | null
  displayText: string
  onEdit: () => void
  onDelete: () => void
  updateItem: (input: {
    ingredientId: string
    data: {
      quantity?: number
      unit?: string
      unitType?: 'volume' | 'weight' | 'count'
      rawString?: string
    }
  }) => void
  optimisticUpdateQuantity: (ingredientId: string, data: {
    quantity: number
    unit: string
    unitType: 'volume' | 'weight' | 'count'
  }) => void
}) {
  const t = useTranslations()
  const display = getIngredientDisplayQuantityAndUnit(
    displayIngredient,
    preferredWeightUnit,
    preferredVolumeUnit
  )
  const [inputValue, setInputValue] = useState(
    display ? String(display.displayQuantity) : ''
  )
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingRef = useRef<{ quantity: number; unit: string; unitType: 'volume' | 'weight' | 'count' } | null>(null)

  useEffect(() => {
    if (display) setInputValue(String(display.displayQuantity))
  }, [display?.displayQuantity])

  const flushDebounce = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
    const pending = pendingRef.current
    if (pending) {
      pendingRef.current = null
      updateItem({
        ingredientId: ingredient.id,
        data: {
          quantity: pending.quantity,
          unit: pending.unit,
          unitType: pending.unitType
        }
      })
    }
  }, [ingredient.id, updateItem])

  useEffect(() => () => { flushDebounce() }, [flushDebounce])

  const step =
    display?.unitType === 'count'
      ? QUANTITY_STEP_COUNT
      : QUANTITY_STEP_WEIGHT_VOLUME
  const min =
    display?.unitType === 'count' ? 0 : MIN_WEIGHT_VOLUME

  const persistQuantity = useCallback((qty: number) => {
    if (!display || qty < min) return
    optimisticUpdateQuantity(ingredient.id, {
      quantity: qty,
      unit: display.displayUnit,
      unitType: display.unitType
    })
    pendingRef.current = { quantity: qty, unit: display.displayUnit, unitType: display.unitType }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(flushDebounce, DEBOUNCE_MS)
  }, [display, min, ingredient.id, optimisticUpdateQuantity, flushDebounce])

  const handleDecrease = () => {
    if (!display) return
    const current = display.displayQuantity
    const next = Math.max(min, Math.round((current - step) * 1000) / 1000)
    if (next !== current) {
      setInputValue(String(next))
      persistQuantity(next)
    }
  }

  const handleIncrease = () => {
    if (!display) return
    const current = display.displayQuantity
    const next = Math.round((current + step) * 1000) / 1000
    setInputValue(String(next))
    persistQuantity(next)
  }

  const handleInputBlur = () => {
    if (!display) return
    const parsed = parseFloat(inputValue)
    if (!Number.isFinite(parsed) || parsed < min) {
      flushDebounce()
      setInputValue(String(display.displayQuantity))
      return
    }
    const rounded =
      display.unitType === 'count'
        ? Math.round(parsed)
        : Math.round(parsed * 1000) / 1000
    setInputValue(String(rounded))
    if (rounded !== display.displayQuantity) {
      persistQuantity(rounded)
      flushDebounce()
    } else {
      flushDebounce()
    }
  }

  if (!display) {
    return (
      <li className='text-foreground flex items-center justify-between gap-2 rounded-md border border-muted/50 bg-muted/20 px-3 py-2'>
        <span>{displayText}</span>
        <div className='flex items-center gap-1'>
          <Button variant='ghost' size='icon' aria-label={t.get('pantry.editItem')} onClick={onEdit}>
            <PencilIcon className='size-4' />
          </Button>
          <Button variant='ghost' size='icon' aria-label={t.common.delete} onClick={onDelete}>
            <span className='text-destructive text-sm'>&times;</span>
          </Button>
        </div>
      </li>
    )
  }

  const itemLabel =
    ingredient.itemName?.trim() ||
    displayText.replace(new RegExp(`^\\d+(?:\\.\\d+)?\\s*${display.displayUnit}\\s*`, 'i'), '').trim() ||
    displayText

  return (
    <li className='text-foreground flex flex-wrap items-center justify-between gap-2 rounded-md border border-muted/50 bg-muted/20 px-3 py-2'>
      <div className='flex items-center gap-1.5'>
        <Button
          variant='outline'
          size='icon'
          className='size-8 shrink-0'
          aria-label={t.common.decrease}
          onClick={handleDecrease}
        >
          <MinusIcon className='size-4' />
        </Button>
        <Input
          type='number'
          inputMode='decimal'
          min={min}
          step={step}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleInputBlur}
          className='text-foreground [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none h-8 w-16 shrink-0 border px-2 text-center text-sm'
        />
        <BadgeUI variant='outline' className='h-8 shrink-0 px-2 text-xs'>
          {display.displayUnit}
        </BadgeUI>
        <Button
          variant='outline'
          size='icon'
          className='size-8 shrink-0'
          aria-label={t.common.increase}
          onClick={handleIncrease}
        >
          <PlusIcon className='size-4' />
        </Button>
      </div>
      <span className='min-w-0 flex-1 truncate'>{itemLabel}</span>
      <div className='flex items-center gap-1'>
        <Button variant='ghost' size='icon' aria-label={t.get('pantry.editItem')} onClick={onEdit}>
          <PencilIcon className='size-4' />
        </Button>
        <Button variant='ghost' size='icon' aria-label={t.common.delete} onClick={onDelete}>
          <span className='text-destructive text-sm'>&times;</span>
        </Button>
      </div>
    </li>
  )
}

const editPantryItemSchema = z.object({
  rawString: z.string().min(1).max(300)
})
type EditPantryItemValues = z.infer<typeof editPantryItemSchema>

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
  const utils = api.useUtils()
  const userId = useUserId()
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(
    null
  )
  const { mutate: deleteItem } = api.pantry.delete.useMutation({
    onSuccess: () => utils.pantry.byUserId.invalidate({ userId }),
    onError: (err) => toast.error(err.message)
  })
  const { mutate: updateItem, status: updateStatus } =
    api.pantry.update.useMutation({
      onMutate: async (input) => {
        await utils.pantry.byUserId.cancel({ userId })
        const prev = utils.pantry.byUserId.getData({ userId })
        if (!prev) return { prev }
        const hasQuantity =
          input.data.quantity != null &&
          input.data.unit != null &&
          input.data.unitType != null
        if (hasQuantity) {
          utils.pantry.byUserId.setData({ userId }, (old) => {
            if (!old) return old
            return {
              ...old,
              ingredients: old.ingredients.map((ing) =>
                ing.id === input.ingredientId
                  ? {
                      ...ing,
                      quantity: input.data.quantity!,
                      unit: input.data.unit!,
                      unitType: input.data.unitType!
                    }
                  : ing
              )
            }
          })
        } else if (input.data.rawString != null) {
          utils.pantry.byUserId.setData({ userId }, (old) => {
            if (!old) return old
            return {
              ...old,
              ingredients: old.ingredients.map((ing) =>
                ing.id === input.ingredientId
                  ? { ...ing, rawString: input.data.rawString! }
                  : ing
              )
            }
          })
        }
        return { prev }
      },
      onSuccess: () => {
        utils.pantry.byUserId.invalidate({ userId })
        setEditingIngredient(null)
      },
      onError: (err, _variables, ctx) => {
        if (ctx?.prev) utils.pantry.byUserId.setData({ userId }, ctx.prev)
        toast.error(err.message)
      }
    })
  const optimisticUpdateQuantity = useCallback(
    (
      ingredientId: string,
      data: {
        quantity: number
        unit: string
        unitType: 'volume' | 'weight' | 'count'
      }
    ) => {
      utils.pantry.byUserId.setData({ userId }, (old) => {
        if (!old) return old
        return {
          ...old,
          ingredients: old.ingredients.map((ing) =>
            ing.id === ingredientId
              ? { ...ing, quantity: data.quantity, unit: data.unit, unitType: data.unitType }
              : ing
          )
        }
      })
    },
    [userId, utils]
  )
  const getDisplayIngredient = useCallback(
    (ing: Ingredient): Ingredient => {
      if (
        pendingAddVariables?.id === ing.id &&
        pendingAddVariables?.rawLine &&
        (ing.quantity == null || ing.unit == null)
      ) {
        const parsed = ingredientStringToCreatePayload(pendingAddVariables.rawLine)
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
    },
    [pendingAddVariables]
  )
  const displayText = (ing: Ingredient) => {
    const displayIng = getDisplayIngredient(ing)
    return (
      getIngredientDisplayTextInPreferredUnits(
        displayIng,
        preferredWeightUnit,
        preferredVolumeUnit
      ) || getIngredientDisplayText(displayIng)
    )
  }
  const sorted = [...ingredients].sort((a, b) =>
    displayText(a).localeCompare(displayText(b))
  )

  return (
    <>
      <ul className='flex flex-col gap-2'>
        {sorted.map((ing) => (
          <PantryRow
            key={ing.id}
            ingredient={ing}
            displayIngredient={getDisplayIngredient(ing)}
            preferredWeightUnit={preferredWeightUnit}
            preferredVolumeUnit={preferredVolumeUnit}
            displayText={displayText(ing)}
            onEdit={() => setEditingIngredient(ing)}
            onDelete={() => deleteItem({ ingredientId: ing.id })}
            updateItem={updateItem}
            optimisticUpdateQuantity={optimisticUpdateQuantity}
          />
        ))}
      </ul>
      {editingIngredient && (
        <EditPantryItemDrawer
          ingredient={editingIngredient}
          open={!!editingIngredient}
          onOpenChange={(open) => !open && setEditingIngredient(null)}
          updateItem={updateItem}
          isLoading={updateStatus === 'pending'}
        />
      )}
    </>
  )
}

function EditPantryItemDrawer({
  ingredient,
  open,
  onOpenChange,
  updateItem,
  isLoading
}: {
  ingredient: Ingredient
  open: boolean
  onOpenChange: (open: boolean) => void
  updateItem: (input: {
    ingredientId: string
    data: { rawString: string }
  }) => void
  isLoading: boolean
}) {
  const t = useTranslations()
  const form = useAppForm(editPantryItemSchema, {
    defaultValues: {
      rawString: getIngredientDisplayText(ingredient)
    },
    values: open ? { rawString: getIngredientDisplayText(ingredient) } : undefined
  })

  const onSubmit = (values: EditPantryItemValues) => {
    updateItem({
      ingredientId: ingredient.id,
      data: { rawString: values.rawString.trim() }
    })
  }

  return (
    <DrawerDialog
      title={t.get('pantry.editItem')}
      description={t.get('pantry.editItemDescription')}
      open={open}
      onOpenChange={onOpenChange}
      cancelText={t.common.cancel}
      submitText={t.common.save}
      formId='edit-pantry-item-form'
      isLoading={isLoading}
    >
      <Form
        form={form}
        onSubmit={onSubmit}
        formId='edit-pantry-item-form'
        className='flex flex-col gap-4'
      >
        <FormInput
          name='rawString'
          placeholder={t.pantry.addItemPlaceholder}
        />
      </Form>
    </DrawerDialog>
  )
}

function UseInChatButton() {
  const t = useTranslations()
  const { open } = useChatPanelStore()

  const handleClick = () => {
    chatStore
      .getState()
      .setInput('What can I make with what I have?')
    open()
  }

  return (
    <Button variant='outline' size='sm' onClick={handleClick}>
      <MessageSquareIcon className='size-4' />
      {t.pantry.useInChat}
    </Button>
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
      <p className='text-foreground text-center text-sm'>
        {t.pantry.addItem}
      </p>
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


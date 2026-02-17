'use client'

import React, { type ReactNode, useEffect, useState } from 'react'
import type { Ingredient } from '@prisma/client'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTranslations } from '~/hooks/use-translations'
import { api } from '~/trpc/react'
import { useUserId } from '~/hooks/use-user-id'
import { ArrowDownIcon, MessageSquareIcon, MinusIcon, PencilIcon, PlusIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import z from 'zod'
import {
  getIngredientDisplayText,
  getIngredientDisplayTextInPreferredUnits,
  getIngredientDisplayQuantityAndUnit
} from '~/lib/ingredient-display'
import { AddToPantryForm } from './add-to-pantry-form'
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

export function PantryByUserId() {
  const [pantry] = usePantryData()
  const { data: user } = api.users.get.useQuery()
  const ingredients = pantry?.ingredients ?? []
  const preferredWeight = user?.preferredWeightUnit ?? null
  const preferredVolume = user?.preferredVolumeUnit ?? null

  if (ingredients.length === 0) {
    return (
      <EmptyPantry>
        <AddToPantryForm />
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
      />
      <div className='fixed bottom-0 left-0 w-full'>
        <AddToPantryForm />
      </div>
    </div>
  )
}

const QUANTITY_STEP_COUNT = 1
const QUANTITY_STEP_WEIGHT_VOLUME = 0.25
const MIN_WEIGHT_VOLUME = 0.25

function PantryRow({
  ingredient,
  preferredWeightUnit,
  preferredVolumeUnit,
  displayText,
  onEdit,
  onDelete,
  updateItem
}: {
  ingredient: Ingredient
  preferredWeightUnit?: string | null
  preferredVolumeUnit?: string | null
  displayText: string
  onEdit: () => void
  onDelete: () => void
  updateItem: (input: {
    ingredientId: string
    data: {
      quantity: number
      unit: string
      unitType: 'volume' | 'weight' | 'count'
    }
  }) => void
}) {
  const t = useTranslations()
  const display = getIngredientDisplayQuantityAndUnit(
    ingredient,
    preferredWeightUnit,
    preferredVolumeUnit
  )
  const [inputValue, setInputValue] = useState(
    display ? String(display.displayQuantity) : ''
  )
  useEffect(() => {
    if (display) setInputValue(String(display.displayQuantity))
  }, [display?.displayQuantity])

  const step =
    display?.unitType === 'count'
      ? QUANTITY_STEP_COUNT
      : QUANTITY_STEP_WEIGHT_VOLUME
  const min =
    display?.unitType === 'count' ? 0 : MIN_WEIGHT_VOLUME

  const persistQuantity = (qty: number) => {
    if (!display || qty < min) return
    updateItem({
      ingredientId: ingredient.id,
      data: {
        quantity: qty,
        unit: display.displayUnit,
        unitType: display.unitType
      }
    })
  }

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
  preferredVolumeUnit
}: {
  ingredients: Ingredient[]
  preferredWeightUnit?: string | null
  preferredVolumeUnit?: string | null
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
      onSuccess: () => {
        utils.pantry.byUserId.invalidate({ userId })
        setEditingIngredient(null)
      },
      onError: (err) => toast.error(err.message)
    })
  const displayText = (ing: Ingredient) =>
    getIngredientDisplayTextInPreferredUnits(
      ing,
      preferredWeightUnit,
      preferredVolumeUnit
    ) || getIngredientDisplayText(ing)
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
            preferredWeightUnit={preferredWeightUnit}
            preferredVolumeUnit={preferredVolumeUnit}
            displayText={displayText(ing)}
            onEdit={() => setEditingIngredient(ing)}
            onDelete={() => deleteItem({ ingredientId: ing.id })}
            updateItem={updateItem}
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
  const form = useForm<EditPantryItemValues>({
    resolver: zodResolver(editPantryItemSchema),
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
  const params = useParams()
  const lang = (params?.lang as string) ?? 'en'
  const href = `/${lang}/chat?prompt=${encodeURIComponent('What can I make with what I have?')}`

  return (
    <Button variant='outline' size='sm' asChild>
      <Link href={href}>
        <MessageSquareIcon className='size-4' />
        {t.pantry.useInChat}
      </Link>
    </Button>
  )
}

function EmptyPantry({ children }: { children: ReactNode }) {
  const t = useTranslations()

  return (
    <div className='fixed inset-0 my-auto grid place-items-center'>
      <div className='bg-background rounded-lg'>
        <h1 className='text-foreground my-auto px-5 text-center text-2xl font-bold'>
          {t.pantry.noItems}
        </h1>
        <Alert className='mx-4 mt-2'>
          <AlertTitle>{t.pantry.noItems}</AlertTitle>
          <AlertDescription>{t.pantry.emptyAlert}</AlertDescription>
        </Alert>
        <div className='left-0 w-full'>{children}</div>
        <div className='fixed bottom-[3.6rem] left-0 flex w-full flex-col items-center justify-center gap-2 sm:bottom-16'>
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
      </div>
    </div>
  )
}


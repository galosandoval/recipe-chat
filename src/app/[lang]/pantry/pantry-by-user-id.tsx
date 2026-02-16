'use client'

import React, { type ReactNode, useState } from 'react'
import type { Ingredient } from '@prisma/client'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useTranslations } from '~/hooks/use-translations'
import { api } from '~/trpc/react'
import { useUserId } from '~/hooks/use-user-id'
import { ArrowDownIcon, MessageSquareIcon, PencilIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import z from 'zod'
import {
  getIngredientDisplayText,
  getIngredientDisplayTextInPreferredUnits
} from '~/lib/ingredient-display'
import { AddToPantryForm } from './add-to-pantry-form'
import { BulkAddPantry } from './bulk-add-pantry'
import { Button } from '~/components/button'
import { toast } from '~/components/toast'
import { DrawerDialog } from '~/components/drawer-dialog'
import { Form } from '~/components/form/form'
import { FormInput } from '~/components/form/form-input'

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
  const t = useTranslations()
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
          <li
            key={ing.id}
            className='text-foreground flex items-center justify-between gap-2 rounded-md border border-muted/50 bg-muted/20 px-3 py-2'
          >
            <span>{displayText(ing)}</span>
            <div className='flex items-center gap-1'>
              <Button
                variant='ghost'
                size='icon'
                aria-label={t.get('pantry.editItem')}
                onClick={() => setEditingIngredient(ing)}
              >
                <PencilIcon className='size-4' />
              </Button>
              <Button
                variant='ghost'
                size='icon'
                aria-label={t.common.delete}
                onClick={() => deleteItem({ ingredientId: ing.id })}
              >
                <span className='text-destructive text-sm'>&times;</span>
              </Button>
            </div>
          </li>
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
  const params = useParams()
  const lang = (params?.lang as string) ?? 'en'
  const href = `/${lang}/chat?prompt=${encodeURIComponent('What can I make with what I have?')}`

  return (
    <div className='fixed inset-0 my-auto grid place-items-center'>
      <div className='bg-background rounded-lg'>
        <h1 className='text-foreground my-auto px-5 text-center text-2xl font-bold'>
          {t.pantry.noItems}
        </h1>
        <div className='left-0 w-full'>{children}</div>
        <div className='fixed bottom-[3.6rem] left-0 flex w-full flex-col items-center justify-center gap-2 sm:bottom-16'>
          <p className='text-foreground text-center text-sm'>
            {t.pantry.addItem}
          </p>
          <Button variant='outline' size='sm' asChild className='mt-1'>
            <Link href={href}>
              <MessageSquareIcon className='size-4' />
              {t.pantry.useInChat}
            </Link>
          </Button>
          <div className='text-primary animate-bounce'>
            <ArrowDownIcon className='size-4' />
          </div>
        </div>
      </div>
    </div>
  )
}


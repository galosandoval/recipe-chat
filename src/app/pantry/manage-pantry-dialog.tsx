'use client'

import { useRef, useState } from 'react'
import { z } from 'zod'
import { Controller, useFieldArray, useWatch } from 'react-hook-form'
import type { Control, UseFormReturn } from 'react-hook-form'
import { MinusIcon, PencilIcon, PlusIcon, SaveIcon, XIcon } from 'lucide-react'
import type { Ingredient } from '@prisma/client'
import { DrawerDialog } from '~/components/drawer-dialog'
import { Dialog } from '~/components/dialog'
import { Button } from '~/components/button'
import { toast } from '~/components/toast'
import { Form } from '~/components/form/form'
import { FormInput } from '~/components/form/form-input'
import { Input } from '~/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '~/components/ui/select'
import { useAppForm } from '~/hooks/use-app-form'
import { useTranslations } from '~/hooks/use-translations'
import { useUserId } from '~/hooks/use-user-id'
import { api } from '~/trpc/react'
import { getIngredientItemDisplay } from '~/components/ingredient-item-display'

const MANAGE_PANTRY_FORM_ID = 'manage-pantry-form'

const QUANTITY_STEP_COUNT = 1
const QUANTITY_STEP_FRACTION = 0.25
const MIN_FRACTION = 0.25

type PantryUnitType = 'volume' | 'weight' | 'count'

/**
 * Curated, singular units offered in the unit dropdown, grouped by kind.
 * `labelKey` maps to a `pantry.units.*` translation for the displayed label.
 */
const UNIT_OPTIONS: {
  value: string
  unitType: PantryUnitType
  labelKey: string
}[] = [
  { value: 'tsp', unitType: 'volume', labelKey: 'tsp' },
  { value: 'tbsp', unitType: 'volume', labelKey: 'tbsp' },
  { value: 'cup', unitType: 'volume', labelKey: 'cup' },
  { value: 'fl oz', unitType: 'volume', labelKey: 'flOz' },
  { value: 'ml', unitType: 'volume', labelKey: 'ml' },
  { value: 'l', unitType: 'volume', labelKey: 'l' },
  { value: 'pinch', unitType: 'volume', labelKey: 'pinch' },
  { value: 'g', unitType: 'weight', labelKey: 'g' },
  { value: 'kg', unitType: 'weight', labelKey: 'kg' },
  { value: 'oz', unitType: 'weight', labelKey: 'oz' },
  { value: 'lb', unitType: 'weight', labelKey: 'lb' },
  { value: 'clove', unitType: 'count', labelKey: 'clove' },
  { value: 'piece', unitType: 'count', labelKey: 'piece' },
  { value: 'slice', unitType: 'count', labelKey: 'slice' },
  { value: 'can', unitType: 'count', labelKey: 'can' },
  { value: 'jar', unitType: 'count', labelKey: 'jar' },
  { value: 'bunch', unitType: 'count', labelKey: 'bunch' },
  { value: 'sprig', unitType: 'count', labelKey: 'sprig' },
  { value: 'head', unitType: 'count', labelKey: 'head' },
  { value: 'stalk', unitType: 'count', labelKey: 'stalk' }
]

const unitTypeOf = (unit: string): PantryUnitType | null =>
  UNIT_OPTIONS.find((option) => option.value === unit)?.unitType ?? null

const managePantrySchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      name: z.string().trim().min(1).max(300),
      quantity: z.number().nullable(),
      unit: z.string(),
      unitType: z.enum(['volume', 'weight', 'count']).nullable(),
      hasUnits: z.boolean()
    })
  )
})
type ManagePantryForm = z.infer<typeof managePantrySchema>
type PantryDraftItem = ManagePantryForm['items'][number]

/**
 * Builds the editable draft from the pantry's ingredients, using their display
 * quantity/unit (in preferred units) so edits operate on what the user sees.
 */
function toDraft(
  ingredients: Ingredient[],
  preferredWeightUnit?: string | null,
  preferredVolumeUnit?: string | null
): PantryDraftItem[] {
  return ingredients.map((ingredient) => {
    const { display, displayText, itemName } = getIngredientItemDisplay(
      ingredient,
      preferredWeightUnit,
      preferredVolumeUnit
    )
    if (!display) {
      return {
        id: ingredient.id,
        name: displayText,
        quantity: null,
        unit: '',
        unitType: null,
        hasUnits: false
      }
    }
    return {
      id: ingredient.id,
      name: itemName,
      quantity: display.displayQuantity,
      unit: display.displayUnit,
      unitType: display.unitType,
      hasUnits: true
    }
  })
}

const isRowChanged = (a: PantryDraftItem, b: PantryDraftItem) =>
  a.name.trim() !== b.name.trim() ||
  a.quantity !== b.quantity ||
  a.unit !== b.unit

type PantryUpdate = {
  ingredientId: string
  data: {
    rawString?: string
    quantity?: number | null
    unit?: string | null
    unitType?: PantryUnitType | null
    itemName?: string | null
  }
}

const toUpdate = (item: PantryDraftItem): PantryUpdate => {
  if (!item.hasUnits) {
    return { ingredientId: item.id, data: { rawString: item.name.trim() } }
  }
  return {
    ingredientId: item.id,
    data: {
      quantity: item.quantity,
      unit: item.unit,
      unitType: item.unitType,
      itemName: item.name.trim()
    }
  }
}

/**
 * Staged editor for the whole pantry, modeled on the recipe-filters manage
 * dialog: +/- quantity, unit dropdown, and name edits mutate a local draft;
 * Save commits every change (and removal) in one `pantry.bulkUpdate` call.
 */
export function ManagePantryDialog({
  ingredients,
  preferredWeightUnit,
  preferredVolumeUnit
}: {
  ingredients: Ingredient[]
  preferredWeightUnit?: string | null
  preferredVolumeUnit?: string | null
}) {
  const t = useTranslations()
  const [open, setOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const { mutate: bulkUpdate, isPending } = useBulkUpdatePantry()
  const originalRef = useRef<Map<string, PantryDraftItem>>(new Map())

  const form = useAppForm(managePantrySchema, {
    defaultValues: { items: [] }
  })
  const { fields, remove } = useFieldArray({
    control: form.control,
    name: 'items',
    keyName: 'fieldId'
  })
  const isDirty = form.formState.isDirty

  const handleOpenChange = (next: boolean) => {
    if (next) {
      const draft = toDraft(
        ingredients,
        preferredWeightUnit,
        preferredVolumeUnit
      )
      originalRef.current = new Map(draft.map((item) => [item.id, item]))
      form.reset({ items: draft })
      setOpen(true)
      return
    }
    if (isDirty) {
      setConfirmOpen(true)
      return
    }
    setOpen(false)
  }

  const handleSave = (values: ManagePantryForm) => {
    const currentIds = new Set(values.items.map((item) => item.id))
    const deletedIds = [...originalRef.current.keys()].filter(
      (id) => !currentIds.has(id)
    )
    const updates = values.items
      .filter((item) => {
        const original = originalRef.current.get(item.id)
        return original ? isRowChanged(item, original) : false
      })
      .map(toUpdate)

    if (updates.length === 0 && deletedIds.length === 0) {
      setOpen(false)
      return
    }
    bulkUpdate({ updates, deletedIds }, { onSuccess: () => setOpen(false) })
  }

  const confirmDiscard = () => {
    setConfirmOpen(false)
    setOpen(false)
  }

  return (
    <>
      <DrawerDialog
        open={open}
        onOpenChange={handleOpenChange}
        trigger={
          <Button variant='outline' size='sm' aria-label={t.pantry.managePantry}>
            <PencilIcon className='size-4' />
            {t.pantry.managePantry}
          </Button>
        }
        title={t.pantry.managePantry}
        description={t.pantry.managePantryDescription}
        formId={MANAGE_PANTRY_FORM_ID}
        submitIcon={<SaveIcon />}
        submitText={t.common.save}
        cancelText={t.common.cancel}
        isLoading={isPending}
      >
        <Form form={form} formId={MANAGE_PANTRY_FORM_ID} onSubmit={handleSave}>
          {fields.length === 0 ? (
            <div className='text-muted-foreground'>{t.pantry.noItems}</div>
          ) : (
            <ul className='flex flex-col gap-3'>
              {fields.map((field, index) => (
                <PantryDraftRow
                  key={field.fieldId}
                  control={form.control}
                  form={form}
                  index={index}
                  hasUnits={field.hasUnits}
                  onRemove={() => remove(index)}
                />
              ))}
            </ul>
          )}
        </Form>
      </DrawerDialog>

      <Dialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t.pantry.discardTitle}
        description={t.pantry.discardDescription}
        cancelText={t.pantry.discardKeep}
        submitText={t.pantry.discardConfirm}
        primaryButtonType='button'
        onClickConfirm={confirmDiscard}
      />
    </>
  )
}

function PantryDraftRow({
  control,
  form,
  index,
  hasUnits,
  onRemove
}: {
  control: Control<ManagePantryForm>
  form: UseFormReturn<ManagePantryForm>
  index: number
  hasUnits: boolean
  onRemove: () => void
}) {
  const t = useTranslations()
  const quantity = useWatch({ control, name: `items.${index}.quantity` })
  const unitType = useWatch({ control, name: `items.${index}.unitType` })

  const isCount = unitType === 'count'
  const step = isCount ? QUANTITY_STEP_COUNT : QUANTITY_STEP_FRACTION
  const min = isCount ? 0 : MIN_FRACTION

  const setQuantity = (next: number) => {
    form.setValue(`items.${index}.quantity`, next, {
      shouldDirty: true,
      shouldValidate: true
    })
  }

  const handleDecrease = () => {
    const current = quantity ?? 0
    const next = Math.max(min, Math.round((current - step) * 1000) / 1000)
    if (next !== current) setQuantity(next)
  }

  const handleIncrease = () => {
    const current = quantity ?? 0
    setQuantity(Math.round((current + step) * 1000) / 1000)
  }

  return (
    <li className='flex flex-col gap-2'>
      {hasUnits ? (
        <div className='flex items-center gap-1.5'>
          <Button
            type='button'
            variant='outline'
            size='icon'
            className='size-8 shrink-0'
            aria-label={t.common.decrease}
            onClick={handleDecrease}
            icon={<MinusIcon className='size-4' />}
          />
          <Input
            type='number'
            inputMode='decimal'
            min={min}
            step={step}
            value={quantity ?? ''}
            onChange={(e) => {
              const parsed = parseFloat(e.target.value)
              setQuantity(Number.isFinite(parsed) ? parsed : 0)
            }}
            className='h-8 w-16 shrink-0 [appearance:textfield] px-2 text-center text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
          />
          <Button
            type='button'
            variant='outline'
            size='icon'
            className='size-8 shrink-0'
            aria-label={t.common.increase}
            onClick={handleIncrease}
            icon={<PlusIcon className='size-4' />}
          />
          <UnitSelect control={control} form={form} index={index} />
        </div>
      ) : null}
      <div className='flex items-start gap-2'>
        <FormInput<ManagePantryForm>
          name={`items.${index}.name`}
          aria-label={t.pantry.itemName}
          className='flex-1'
        />
        <Button
          type='button'
          variant='ghost'
          size='icon'
          aria-label={t.pantry.removeItem}
          onClick={onRemove}
          icon={<XIcon className='size-4' />}
        />
      </div>
    </li>
  )
}

function UnitSelect({
  control,
  form,
  index
}: {
  control: Control<ManagePantryForm>
  form: UseFormReturn<ManagePantryForm>
  index: number
}) {
  const t = useTranslations()
  const currentUnit = useWatch({ control, name: `items.${index}.unit` })
  const hasOption = UNIT_OPTIONS.some((option) => option.value === currentUnit)
  const groups: { kind: PantryUnitType; label: string }[] = [
    { kind: 'volume', label: t.pantry.volume },
    { kind: 'weight', label: t.pantry.weight },
    { kind: 'count', label: t.pantry.count }
  ]

  return (
    <Controller
      control={control}
      name={`items.${index}.unit`}
      render={({ field }) => (
        <Select
          value={field.value}
          onValueChange={(value) => {
            field.onChange(value)
            form.setValue(
              `items.${index}.unitType`,
              unitTypeOf(value) ?? form.getValues(`items.${index}.unitType`),
              { shouldDirty: true }
            )
          }}
        >
          <SelectTrigger className='h-8 w-24 shrink-0 text-xs'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className='max-h-64'>
            {!hasOption && currentUnit ? (
              <SelectItem value={currentUnit}>{currentUnit}</SelectItem>
            ) : null}
            {groups.map((group) => (
              <SelectGroup key={group.kind}>
                <SelectLabel>{group.label}</SelectLabel>
                {UNIT_OPTIONS.filter(
                  (option) => option.unitType === group.kind
                ).map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {t.pantry.units.get(option.labelKey)}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  )
}

function useBulkUpdatePantry() {
  const userId = useUserId()
  const utils = api.useUtils()
  return api.pantry.bulkUpdate.useMutation({
    onSuccess: async () => {
      await utils.pantry.byUserId.invalidate({ userId })
    },
    onError: (error) => {
      toast.error(error.message)
    }
  })
}

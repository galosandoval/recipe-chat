'use client'

import { PlusIcon, XIcon } from 'lucide-react'
import { useState } from 'react'
import { useFieldArray, type UseFormReturn } from 'react-hook-form'
import { Badge } from '~/components/badge'
import { Button } from '~/components/button'
import { Input } from '~/components/ui/input'
import { FormSelect } from '~/components/form/form-select'
import { useTranslations } from '~/hooks/use-translations'
import type { RecipeByIdData } from '~/hooks/use-recipe'
import { cuisineOptions } from '~/schemas/taste-profile-schema'
import { cuid } from '~/lib/createId'
import type { RecipeEditValues } from './recipe-edit-schema'

const courseOptions = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Appetizer',
  'Main',
  'Side',
  'Dessert',
  'Snack',
  'Drink'
] as const

/**
 * Read-view Facet badges (cuisine · course, then diet then flavor tags). Renders
 * nothing when every Facet is empty, and omits each empty group individually so
 * the page never shows a stray label.
 */
export function RecipeFacetBadges({ data }: { data: RecipeByIdData }) {
  const { cuisine, course, dietTags, flavorTags } = data
  const diet = dietTags ?? []
  const flavor = flavorTags ?? []
  const hasAny = !!cuisine || !!course || diet.length > 0 || flavor.length > 0
  if (!hasAny) return null

  return (
    <div className='flex flex-wrap justify-center gap-2 px-3 pt-2'>
      {cuisine && <Badge label={cuisine} variant='default' />}
      {course && <Badge label={course} variant='secondary' />}
      {diet.map((tag) => (
        <Badge key={`diet-${tag}`} label={tag} variant='outline' />
      ))}
      {flavor.map((tag) => (
        <Badge key={`flavor-${tag}`} label={tag} variant='muted' />
      ))}
    </div>
  )
}

/**
 * Edit-mode Facet block: cuisine/course as single-selects (with a clear "None"
 * option) and diet/flavor tags as Manage-Filters-style draft lists.
 */
export function RecipeFacetsFields({
  form
}: {
  form: UseFormReturn<RecipeEditValues>
}) {
  const t = useTranslations()
  return (
    <div className='flex flex-col gap-4'>
      <FormSelect<RecipeEditValues>
        name='cuisine'
        label={t.recipes.cuisine}
        placeholder={t.recipes.byId.facets.cuisinePlaceholder}
        options={toSelectOptions(cuisineOptions, form.watch('cuisine'), t)}
      />
      <FormSelect<RecipeEditValues>
        name='course'
        label={t.recipes.course}
        placeholder={t.recipes.byId.facets.coursePlaceholder}
        options={toSelectOptions(courseOptions, form.watch('course'), t)}
      />
      <TagDraftList
        form={form}
        name='dietTags'
        label={t.recipes.dietTags}
        placeholder={t.recipes.byId.facets.dietPlaceholder}
      />
      <TagDraftList
        form={form}
        name='flavorTags'
        label={t.recipes.flavorTags}
        placeholder={t.recipes.byId.facets.flavorPlaceholder}
      />
    </div>
  )
}

/**
 * Builds select options from a preset list plus a "None" clear option, keeping
 * the Recipe's current value selectable even when it isn't one of the presets.
 */
function toSelectOptions(
  presets: readonly string[],
  current: string,
  t: ReturnType<typeof useTranslations>
) {
  const options = [{ value: '', label: t.recipes.byId.facets.none }]
  const seen = new Set<string>()
  for (const preset of presets) {
    if (!seen.has(preset)) {
      seen.add(preset)
      options.push({ value: preset, label: preset })
    }
  }
  if (current && !seen.has(current)) {
    options.push({ value: current, label: current })
  }
  return options
}

/**
 * A staged tag editor: one input row per tag with an X-to-remove control, plus a
 * persistent add-row that appends a new tag. Edits mutate the form draft only.
 */
function TagDraftList({
  form,
  name,
  label,
  placeholder
}: {
  form: UseFormReturn<RecipeEditValues>
  name: 'dietTags' | 'flavorTags'
  label: string
  placeholder: string
}) {
  const t = useTranslations()
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name,
    keyName: 'fieldId'
  })
  const [draft, setDraft] = useState('')

  const addTag = () => {
    const value = draft.trim()
    if (!value) return
    append({ id: cuid(), value })
    setDraft('')
  }

  return (
    <div className='flex flex-col gap-2'>
      <span className='text-foreground/90 text-sm font-medium'>{label}</span>
      {fields.length === 0 ? (
        <span className='text-muted-foreground text-sm'>
          {t.recipes.byId.facets.noTags}
        </span>
      ) : (
        <ul className='flex flex-col gap-2'>
          {fields.map((field, index) => (
            <li key={field.fieldId} className='flex items-center gap-2'>
              <Input
                aria-label={label}
                {...form.register(`${name}.${index}.value`)}
              />
              <Button
                type='button'
                variant='ghost'
                size='icon'
                aria-label={`${t.common.delete} ${field.value}`}
                onClick={() => remove(index)}
                icon={<XIcon className='size-4' />}
              />
            </li>
          ))}
        </ul>
      )}
      <div className='flex items-center gap-2'>
        <Input
          value={draft}
          aria-label={placeholder}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addTag()
            }
          }}
        />
        <Button type='button' onClick={addTag} icon={<PlusIcon />}>
          {t.recipes.byId.facets.addTag}
        </Button>
      </div>
    </div>
  )
}

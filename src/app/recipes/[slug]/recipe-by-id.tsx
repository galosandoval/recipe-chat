'use client'

import { useEffect, useRef, useState } from 'react'
import { type Instruction } from '@prisma/client'
import { api } from '~/trpc/react'
import { useAppForm } from '~/hooks/use-app-form'
import { useTranslations } from '~/hooks/use-translations'
import Image from 'next/image'
import { useNoSleep } from '~/hooks/use-no-sleep'
import { IngredientsCheckList } from './ingredients-check-list'
import { cn } from '~/lib/utils'
import { useObervationObserver } from '~/hooks/use-observation-observer'
import { ParallaxContainer } from '~/components/parallax-container'
import { GlassElement } from '~/components/glass-element'
import { NewRecipeTime, RecipeTime } from './recipe-time'
import { Button } from '~/components/button'
import { Card } from '~/components/card'
import { Dialog } from '~/components/dialog'
import { Form } from '~/components/form/form'
import { FormInput } from '~/components/form/form-input'
import { FormTextarea } from '~/components/form/form-textarea'
import { useRegisterFab } from '~/components/fab-stack/use-register-fab'
import {
  AlertCircleIcon,
  Loader2Icon,
  SaveIcon,
  TrashIcon,
  XIcon
} from 'lucide-react'
import { FloatingActionButton } from '~/components/floating-action-button'
import { DeleteRecipeDialog } from '~/components/delete-recipe-dialog'
import { AddImageDropdown } from '~/components/add-image-dropdown'
import type { RecipeByIdData } from '~/hooks/use-recipe'
import { useRecipe } from '~/hooks/use-recipe'
import { useRecipeSlug } from '~/hooks/use-recipe-slug'
import { submitEditRecipe } from '~/lib/submit-edit-recipe'
import type { EditRecipeFormValues } from '~/schemas/recipes-schema'
import {
  recipeEditSchema,
  toRecipeEditDefaults,
  type RecipeEditValues
} from './recipe-edit-schema'
import { RecipeFacetBadges, RecipeFacetsFields } from './recipe-facets'
import { UpdateImage } from './update-recipe-image'
import { useRecipeEditStore } from './recipe-edit-store'

export function RecipeById() {
  useNoSleep()
  const { data: recipe } = useRecipe()

  if (!recipe) return null

  return (
    <div className='relative mx-auto flex max-w-2xl flex-col'>
      <Recipe data={recipe} />
    </div>
  )
}

function Recipe({ data }: { data: RecipeByIdData }) {
  const isEditing = useRecipeEditStore((s) => s.isEditing)
  const setIsEditing = useRecipeEditStore((s) => s.setIsEditing)

  // The flag lives in a shared store so the Navbar can toggle it. Reset it when
  // this recipe unmounts (or the slug changes) so a stale `true` from a previous
  // recipe never drops the next one straight into the edit form.
  useEffect(() => {
    return () => setIsEditing(false)
  }, [setIsEditing, data.id])

  if (isEditing) {
    return <RecipeEditMode data={data} onClose={() => setIsEditing(false)} />
  }

  return <RecipeReadView data={data} />
}

const observerOptions: IntersectionObserverInit = {
  root: null,
  rootMargin: '0px',
  threshold: Array.from({ length: 100 }, (_, i) => i / 100)
}

function RecipeReadView({ data }: { data: RecipeByIdData }) {
  const { ingredients, instructions, notes, name } = data
  const containerRef = useRef<HTMLDivElement>(null)
  const [startRef, startObservation] = useObervationObserver(observerOptions)
  const [endRef, endObservation] = useObervationObserver(observerOptions)
  const intersectionRatio = endObservation?.intersectionRatio ?? 0
  const translateY = `${intersectionRatio * 30}%`

  let containerHeight = 0
  if (containerRef.current) {
    containerHeight = containerRef.current.clientHeight
  }

  const isPastHero =
    Math.abs(startObservation?.boundingClientRect?.y ?? 0) >= containerHeight

  return (
    <>
      <ImageWithTitleAndDescription data={data} translateY={translateY} />

      <div>
        {data?.imgUrl && <StickyHeader visible={isPastHero} name={name} />}
        <div className='mx-auto flex flex-col items-center px-3 pb-4'>
          <div className='bg-background flex flex-col'>
            <IngredientsCheckList ingredients={ingredients} />
            <div className='pt-4'>
              <Instructions instructions={instructions} />
            </div>
            <NotesDisplay notes={notes} />
          </div>
        </div>
      </div>
      {data?.imgUrl ? (
        <ParallaxContainer
          startRef={startRef}
          endRef={endRef}
          containerRef={containerRef}
        />
      ) : null}
    </>
  )
}

function StickyHeader({ name, visible }: { name: string; visible: boolean }) {
  return (
    <div
      className={cn(
        'glass-element from-background to-background/5 border-muted-foreground/20 sticky top-0 z-10 flex items-center justify-center border-b bg-gradient-to-b py-4 opacity-0 transition-opacity duration-300',
        visible && 'opacity-100'
      )}
    >
      <div
        className={cn(
          'bg-transparent px-14 text-lg font-bold opacity-0 transition-opacity duration-300',
          visible && 'opacity-100'
        )}
      >
        {name}
      </div>
    </div>
  )
}

function ImageWithTitleAndDescription({
  data,
  translateY
}: {
  data: RecipeByIdData
  translateY: string
}) {
  return (
    <>
      {data.imgUrl ? (
        <RecipeMetaDataWithImage
          data={data}
          url={data.imgUrl}
          translateY={translateY}
        />
      ) : (
        <RecipeImgButtonAndMetaData data={data} />
      )}
    </>
  )
}

function RecipeImgButtonAndMetaData({ data }: { data: RecipeByIdData }) {
  return (
    <>
      <StickyHeader name={data.name} visible={true} />
      <div className='px-3'>
        <Card
          className='m-3 mx-auto mt-4 max-w-sm'
          contentClassName='flex flex-col items-center justify-center'
        >
          <AddImageDropdown recipeId={data.id} />
          <RecipeInfo data={data} />
        </Card>
      </div>
    </>
  )
}

function RecipeMetaDataWithImage({
  data,
  url,
  translateY
}: {
  data: RecipeByIdData
  url: string
  translateY: string
}) {
  return (
    <div>
      <ImageWithAspectRatio url={url} translateY={translateY} />
      <GlassMetadata data={data} />
    </div>
  )
}

function ImageWithAspectRatio({
  url,
  translateY
}: {
  url: string
  translateY: string
}) {
  return (
    <div className='absolute inset-0 h-svh overflow-hidden'>
      <div className='relative h-[55svh] w-full'>
        <Image
          className='object-cover'
          sizes='100vw'
          alt='recipe'
          fill
          src={url}
          priority
          style={{
            transform: `translateY(${translateY})`
          }}
        />
      </div>
      <div className='relative h-[45svh] w-full -scale-x-100 rotate-180'>
        <Image
          className='object-cover'
          sizes='100vw'
          alt='recipe'
          fill
          src={url}
          priority
        />
      </div>
    </div>
  )
}

function GlassMetadata({ data }: { data: RecipeByIdData }) {
  return (
    <div className='bottom-0 z-0 flex h-svh w-full flex-col justify-end'>
      <div className='h-full flex-1'></div>
      <GlassElement className='to-background/90 sticky top-14 h-full flex-1 bg-gradient-to-b py-4'>
        <RecipeInfo data={data} />
      </GlassElement>
    </div>
  )
}

function RecipeInfo({ data }: { data: RecipeByIdData }) {
  const {
    name,
    prepTime,
    cookTime,
    description,
    cookMinutes,
    prepMinutes,
    servings,
    imgUrl
  } = data

  return (
    // no parent here for sticky header
    <>
      {imgUrl && <h2 className={cn('px-5 text-2xl font-bold')}>{name}</h2>}

      {prepTime != null && cookTime != null && (
        <div className='flex justify-center'>
          <RecipeTime prepTime={prepTime} cookTime={cookTime} />
        </div>
      )}
      {prepMinutes != null && cookMinutes != null && (
        <div className='flex justify-center'>
          <NewRecipeTime
            prepMinutes={prepMinutes}
            cookMinutes={cookMinutes}
            servings={servings}
          />
        </div>
      )}

      <RecipeFacetBadges data={data} />

      {description && (
        <p className={cn('bg-transparent px-3 pt-2 text-sm')}>{description}</p>
      )}
    </>
  )
}

function Instructions({ instructions }: { instructions: Instruction[] }) {
  const t = useTranslations()

  return (
    <>
      <h2 className='text-foreground/90 mb-2 text-lg font-bold'>
        {t.recipes.instructions}
      </h2>
      <ol className='flex list-none flex-col gap-3 pl-0'>
        {instructions.map((i, index) => (
          <li key={i.id} className='bg-accent mt-0 mb-0 rounded-md p-4'>
            <h3 className='text-foreground mb-1 text-sm font-bold uppercase'>
              {t.recipes.step} {index + 1}
            </h3>
            <p>{i.description}</p>
          </li>
        ))}
      </ol>
    </>
  )
}

function NotesDisplay({ notes }: { notes: string }) {
  const t = useTranslations()

  if (!notes) return null

  return (
    <div className='pt-3'>
      <h2 className='text-foreground/90 mb-2 text-lg font-bold'>
        {t.recipes.notes}
      </h2>
      <p className='bg-transparent text-sm whitespace-pre-line'>{notes}</p>
    </div>
  )
}

const EDIT_FORM_ID = 'recipe-edit-form'

function RecipeEditMode({
  data,
  onClose
}: {
  data: RecipeByIdData
  onClose: () => void
}) {
  const t = useTranslations()
  const utils = api.useUtils()
  const slug = useRecipeSlug()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const { mutate: editRecipe, isPending } = api.recipes.edit.useMutation({
    onSuccess: async (newSlug) => {
      await utils.recipes.bySlug.invalidate({ slug: newSlug ?? slug })
      onClose()
    }
  })

  const form = useAppForm(recipeEditSchema, {
    defaultValues: toRecipeEditDefaults(data)
  })
  // Read during render so react-hook-form subscribes the flag and keeps the
  // dirty guard (and discard prompt) reactive to staged edits.
  const isDirty = form.formState.isDirty

  const onSubmit = (values: RecipeEditValues) => {
    if (isPending) return
    const editValues: EditRecipeFormValues = {
      ...values,
      dietTags: values.dietTags.map((tag) => tag.value.trim()).filter(Boolean),
      flavorTags: values.flavorTags
        .map((tag) => tag.value.trim())
        .filter(Boolean)
    }
    editRecipe(submitEditRecipe(data, editValues))
  }

  const handleCancel = () => {
    if (isDirty) {
      setConfirmOpen(true)
      return
    }
    onClose()
  }

  const confirmDiscard = () => {
    setConfirmOpen(false)
    onClose()
  }

  // Cancel/Save move onto the FAB stack (issue #563). Cancel sits below Save
  // (priority 1 vs 2), and Save uses `render` so the FAB can show its pending
  // spinner and stay disabled mid-submit.
  useRegisterFab({
    id: 'recipe-edit-cancel',
    priority: 1,
    ariaLabel: t.recipes.byId.cancel,
    icon: <XIcon />,
    onClick: handleCancel
  })
  useRegisterFab({
    id: 'recipe-edit-save',
    priority: 2,
    render: () => (
      <FloatingActionButton
        aria-label={t.recipes.byId.save}
        disabled={isPending}
        onClick={form.handleSubmit(onSubmit)}
      >
        {isPending ? <Loader2Icon className='animate-spin' /> : <SaveIcon />}
      </FloatingActionButton>
    )
  })

  return (
    <div className='mx-auto flex w-full max-w-2xl flex-col gap-4 px-3 pt-16 pb-10'>
      <Form
        formId={EDIT_FORM_ID}
        form={form}
        onSubmit={onSubmit}
        className='flex flex-col gap-4'
      >
        <UpdateImage imgUrl={data.imgUrl} id={data.id} />
        <FormInput name='name' label={t.recipes.name} />
        <div className='flex justify-between gap-2'>
          <FormInput
            type='number'
            name='prepMinutes'
            label={t.recipes.prepTime}
          />
          <FormInput
            type='number'
            name='cookMinutes'
            label={t.recipes.cookTime}
          />
        </div>
        <RecipeFacetsFields form={form} />
        <FormTextarea name='description' label={t.recipes.description} />
        <FormTextarea
          name='ingredients'
          label={t.recipes.ingredients}
          className='min-h-40'
        />
        <FormTextarea
          name='instructions'
          label={t.recipes.instructions}
          className='min-h-40'
        />
        <FormTextarea name='notes' label={t.recipes.notes} />
        {/* Delete moved off the read-view options menu onto the edit form
            (issue #563); Cancel/Save now live on the FAB stack. */}
        <Button
          type='button'
          variant='destructive'
          onClick={() => setDeleteOpen(true)}
          icon={<TrashIcon className='h-4 w-4' />}
        >
          {t.recipes.delete}
        </Button>
      </Form>

      <DeleteRecipeDialog open={deleteOpen} onOpenChange={setDeleteOpen} />

      <Dialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t.recipes.byId.discardTitle}
        description={t.recipes.byId.discardDescription}
        cancelText={t.recipes.byId.discardKeep}
        submitText={t.recipes.byId.discardConfirm}
        submitIcon={<AlertCircleIcon className='size-4' />}
        primaryButtonType='button'
        onClickConfirm={confirmDiscard}
      />
    </div>
  )
}

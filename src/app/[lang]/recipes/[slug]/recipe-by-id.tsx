'use client'

import { useRef, useMemo } from 'react'
import { type Instruction } from '@prisma/client'
import { api } from '~/trpc/react'
import { useAppForm } from '~/hooks/use-app-form'
import { z } from 'zod'
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
import { Form, FormTextarea } from '~/components/form/form'
import { PencilIcon } from 'lucide-react'
import { AddImageDropdown } from '~/components/add-image-dropdown'
import type { RecipeByIdData } from '~/hooks/use-recipe'
import { useRecipe } from '~/hooks/use-recipe'
import { useRecipeSlug } from '~/hooks/use-recipe-slug'

export default function RecipeById() {
  useNoSleep()
  const { data: recipe } = useRecipe()

  if (!recipe) return null

  return (
    <div className='relative mx-auto flex max-w-2xl flex-col'>
      <FoundRecipe data={recipe} />
    </div>
  )
}

const observerOptions: IntersectionObserverInit = {
  root: null,
  rootMargin: '0px',
  threshold: Array.from({ length: 100 }, (_, i) => i / 100)
}

function FoundRecipe({ data }: { data: RecipeByIdData }) {
  const { ingredients, instructions, notes, name, imgUrl } = data
  const containerRef = useRef<HTMLDivElement>(null)
  const [startRef, startObservation] = useObervationObserver(observerOptions)
  const [endRef, endObservation] = useObervationObserver(observerOptions)
  // Memoize the intersection ratio calculation to prevent unnecessary re-renders
  const intersectionRatio = useMemo(
    () => endObservation?.intersectionRatio ?? 0,
    [endObservation?.intersectionRatio]
  )

  // Memoize the translateY calculation
  const translateY = useMemo(
    () => `${intersectionRatio * 30}%`,
    [intersectionRatio]
  )
  // Memoize the container height to prevent unnecessary re-renders
  const containerHeight = useMemo(() => {
    if (containerRef.current) {
      return containerRef.current.clientHeight
    }
    return 0
  }, [containerRef.current])

  const isPastHero = useMemo(() => {
    return (
      Math.abs(startObservation?.boundingClientRect?.y ?? 0) >= containerHeight
    )
  }, [startObservation?.boundingClientRect, containerHeight])

  return (
    <>
      <ImageWithTitleAndDescription data={data} translateY={translateY} />

      <div>
        {data?.imgUrl && (
          <StickyHeader visible={isPastHero} name={name} imgUrl={imgUrl} />
        )}
        <div className='mx-auto flex flex-col items-center px-3 pb-4'>
          <div className='bg-background flex flex-col'>
            <IngredientsCheckList ingredients={ingredients} />
            <div className='pt-4'>
              <Instructions instructions={instructions} />
            </div>
            <Notes notes={notes} id={data.id} />
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

function StickyHeader({
  name,
  visible,
  imgUrl
}: {
  name: string
  visible: boolean
  imgUrl?: string | null
}) {
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
        <RecipeMetaDataWithImage url={data.imgUrl} translateY={translateY} />
      ) : (
        <RecipeImgButtonAndMetaData />
      )}
    </>
  )
}

function RecipeImgButtonAndMetaData() {
  const { data } = useRecipe()

  if (!data) return null
  return (
    <>
      <StickyHeader imgUrl={data.imgUrl} name={data.name} visible={true} />
      <div className='px-3'>
        <Card
          className='m-3 mx-auto mt-4 max-w-sm'
          contentClassName='flex flex-col items-center justify-center'
        >
          <AddImageDropdown recipeId={data.id} />
          <RecipeInfo />
        </Card>
      </div>
    </>
  )
}

function RecipeMetaDataWithImage({
  url,
  translateY
}: {
  url: string
  translateY: string
}) {
  return (
    <div>
      <ImageWithAspectRatio url={url} translateY={translateY} />
      <GlassMetadata />
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
      <div className='relative h-[45svh] w-full rotate-180'>
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

function GlassMetadata() {
  return (
    <div className='bottom-0 z-0 flex h-svh w-full flex-col justify-end'>
      <div className='h-full flex-1'></div>
      <GlassElement className='to-background/90 sticky top-14 h-full flex-1 bg-gradient-to-b py-4'>
        <RecipeInfo />
      </GlassElement>
    </div>
  )
}

function RecipeInfo() {
  const utils = api.useUtils()
  const slug = useRecipeSlug()
  const data = utils.recipes.bySlug.getData({ slug })

  if (!data) return null

  const {
    name,
    prepTime,
    cookTime,
    description,
    cookMinutes,
    prepMinutes,
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
          <NewRecipeTime prepMinutes={prepMinutes} cookMinutes={cookMinutes} />
        </div>
      )}
      {description && (
        <p className={cn('text-muted-foreground bg-transparent px-3 text-sm')}>
          {description}
        </p>
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
          <li key={i.id} className='bg-secondary mt-0 mb-0 rounded-md p-4'>
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

const addNotesSchema = z.object({
  notes: z.string()
})
type AddNotes = z.infer<typeof addNotesSchema>

function Notes({ notes, id }: { notes: string; id: string }) {
  const t = useTranslations()
  const utils = api.useUtils()
  const slug = useRecipeSlug()
  const { mutate, isPending, variables } = api.recipes.addNotes.useMutation({
    onSettled: () => utils.recipes.bySlug.invalidate({ slug })
  })

  const form = useAppForm(addNotesSchema, {
    defaultValues: { notes: '' },
    values: {
      // optimistic update
      notes: isPending ? variables?.notes : notes
    }
  })

  const onSubmit = (values: AddNotes) => {
    if (isPending) return
    mutate({ id, notes: values.notes })
  }

  return (
    <div className='pt-3'>
      <Form
        formId='add-notes-form'
        form={form}
        onSubmit={onSubmit}
        className='flex flex-col gap-2'
      >
        <FormTextarea
          label='Notes'
          labelClassName='text-foreground/90 mb-2 text-lg font-bold'
          placeholder={t.recipes.byId.placeholder}
          name='notes'
          className='resize-none placeholder:text-sm'
        />
        <Button
          disabled={!form.formState.isDirty || !form.formState.isValid}
          isLoading={isPending}
          type='submit'
          className='self-end'
          icon={<PencilIcon />}
        >
          {t.recipes.byId.updateNotes}
        </Button>
      </Form>
    </div>
  )
}

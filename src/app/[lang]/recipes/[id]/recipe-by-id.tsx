'use client'

import { useRef, useMemo } from 'react'
import { type Instruction } from '@prisma/client'
import { Button } from '~/components/button'
import { type RouterOutputs, api } from '~/trpc/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslations } from '~/hooks/use-translations'
import Image from 'next/image'
import { useNoSleep } from '~/hooks/use-no-sleep'
import { IngredientsCheckList } from './ingredients-check-list'
import { cn } from '~/utils/cn'
import { useObervationObserver } from '~/hooks/use-observation-observer'
import { useParams } from 'next/navigation'
import { UploadImageButton } from '~/components/upload-image-button'
import { ParallaxContainer } from '~/components/parallax-container'
import { useState } from 'react'
import { GlassElement } from '~/components/glass-element'
import { NewRecipeTime, RecipeTime } from './recipe-time'

type RecipeByIdData = NonNullable<RouterOutputs['recipes']['byId']>

export default function RecipeById({ data }: { data: RecipeByIdData }) {
  useNoSleep()
  const { data: recipe } = api.recipes.byId.useQuery(
    { id: data.id },
    { initialData: data }
  )

  if (!recipe) return null

  return (
    <div className='relative flex h-full max-w-md flex-col overflow-y-auto'>
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
  const { ingredients, instructions, notes, id, name } = data
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
      <ImageWithTitleAndDescription
        data={data}
        translateY={translateY}
        containerHeight={containerHeight}
      />

      <div className='relative'>
        {data?.imgUrl && <StickyHeader visible={isPastHero} name={name} />}
        <div className='mx-auto flex flex-col items-center px-4 pb-4'>
          <div className='bg-base-100 flex flex-col'>
            <IngredientsCheckList ingredients={ingredients} />
            <div className='pt-4'>
              <Instructions instructions={instructions} />
            </div>
            <Notes notes={notes} id={id} />
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
        'glass-element sticky top-0 z-10 -mt-14 flex items-center justify-center py-5 opacity-0 transition-opacity duration-300',
        visible && 'opacity-100'
      )}
    >
      <div
        className={cn(
          'text-glass bg-transparent text-lg font-bold opacity-0 transition-opacity duration-300',
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
  translateY,
  containerHeight
}: {
  data: RecipeByIdData
  translateY: string
  containerHeight: number | undefined
}) {
  return (
    <>
      {data.imgUrl ? (
        <RecipeMetaDataWithImage
          url={data.imgUrl}
          translateY={translateY}
          containerHeight={containerHeight}
        />
      ) : (
        <RecipeImgButtonAndMetaData />
      )}
    </>
  )
}

function RecipeImgButtonAndMetaData() {
  const { id } = useParams()
  const { data } = api.recipes.byId.useQuery({ id: id as string })

  if (!data) return null
  return (
    <>
      <StickyHeader name={data.name} visible={true} />
      <div className='pt-10'>
        <UploadImageButton />
        <RecipeMetaData textColor='text-base-content' />
      </div>
    </>
  )
}

function RecipeMetaDataWithImage({
  url,
  translateY,
  containerHeight
}: {
  url: string
  translateY: string
  containerHeight: number | undefined
}) {
  if (!containerHeight && containerHeight !== 0) return null

  return (
    <div>
      <ImageWithAspectRatio
        containerHeight={containerHeight}
        url={url}
        translateY={translateY}
      />
      <GlassMetadata />
    </div>
  )
}

const IMG_HEIGHT_OFFSET = 0.66
const IMG_HEIGHT_OFFSET_BOTTOM = 1 - IMG_HEIGHT_OFFSET

function ImageWithAspectRatio({
  containerHeight,
  url,
  translateY
}: {
  containerHeight: number
  url: string
  translateY: string
}) {
  const [aspectRatio, setAspectRatio] = useState<number | null>(null)
  const imgHeight = containerHeight * IMG_HEIGHT_OFFSET

  if (!containerHeight && containerHeight !== 0) return null

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget
    const ratio = img.naturalWidth / img.naturalHeight

    setAspectRatio(ratio)
  }

  return (
    <div className='absolute inset-0 h-svh overflow-hidden'>
      <Image
        className={cn('absolute top-0 -z-10 object-cover object-center')}
        src={url}
        alt='recipe'
        width={aspectRatio ? imgHeight * aspectRatio : imgHeight * 0.75}
        height={imgHeight}
        priority
        onLoad={handleImageLoad}
        style={{
          transform: `translateY(${translateY})`,
          height: containerHeight * IMG_HEIGHT_OFFSET
        }}
      />
      <Image
        className={cn(
          'absolute bottom-0 -z-10 h-full rotate-180 object-cover object-center'
        )}
        src={url}
        alt='recipe'
        width={aspectRatio ? imgHeight * aspectRatio : imgHeight * 0.75}
        height={imgHeight}
        priority
        onLoad={handleImageLoad}
        style={{
          transform: `translateY(${translateY})`,
          height: containerHeight * IMG_HEIGHT_OFFSET_BOTTOM
        }}
      />
    </div>
  )
}

function GlassMetadata() {
  return (
    <div className='bottom-0 z-0 flex h-svh w-full flex-col justify-end'>
      <div className='h-full flex-1'></div>
      <div className='sticky top-0 h-full flex-1 bg-gradient-to-b from-slate-900/15 to-slate-900'>
        <GlassElement className='h-full bg-transparent py-4'>
          <RecipeMetaData textColor='text-glass' />
        </GlassElement>
      </div>
    </div>
  )
}

function RecipeMetaData({ textColor }: { textColor: string }) {
  const utils = api.useUtils()
  const { id } = useParams()
  const data = utils.recipes.byId.getData({ id: id as string })

  if (!data) return null

  const { name, prepTime, cookTime, description, cookMinutes, prepMinutes } =
    data

  return (
    <>
      <h2 className={cn('px-5 text-2xl font-bold', textColor)}>{name}</h2>

      {prepTime && cookTime && (
        <div className='flex justify-center px-5'>
          <RecipeTime prepTime={prepTime} cookTime={cookTime} />
        </div>
      )}
      {prepMinutes && cookMinutes && (
        <div className='flex justify-center px-5'>
          <NewRecipeTime prepMinutes={prepMinutes} cookMinutes={cookMinutes} />
        </div>
      )}
      {description && (
        <p className={cn('bg-transparent px-5', textColor)}>{description}</p>
      )}
    </>
  )
}

function Instructions({ instructions }: { instructions: Instruction[] }) {
  const t = useTranslations()

  return (
    <>
      <h2 className='text-base-content/90 mb-2 text-lg font-bold'>
        {t.recipes.instructions}
      </h2>
      <ol className='flex list-none flex-col gap-3 pl-0'>
        {instructions.map((i, index) => (
          <li key={i.id} className='bg-base-300 mt-0 mb-0 rounded p-4'>
            <h3 className='text-base-content mb-1 text-sm font-bold uppercase'>
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
  notes: z.string().nonempty()
})
type AddNotes = z.infer<typeof addNotesSchema>

function Notes({ notes, id }: { notes: string; id: string }) {
  const t = useTranslations()

  const utils = api.useContext()
  const { mutate } = api.recipes.addNotes.useMutation({
    onSuccess() {
      utils.recipes.byId.invalidate({ id })
    }
  })

  const {
    register,
    handleSubmit,
    formState: { isDirty, isValid }
  } = useForm<AddNotes>({
    resolver: zodResolver(addNotesSchema)
  })

  if (notes) {
    return (
      <>
        <h2 className='divider'>{t.recipes.notes}</h2>
        <p className='whitespace-pre-line'>{notes}</p>
      </>
    )
  }

  return (
    <>
      <h2 className='divider'>{t.recipes.notes}</h2>
      <form
        onSubmit={handleSubmit(({ notes }) => {
          mutate({ id, notes })
        })}
        className='flex flex-col gap-2 pb-4'
      >
        <textarea
          className='textarea textarea-primary w-full resize-none'
          placeholder={t.recipes.byId.placeholder}
          {...register('notes')}
        ></textarea>
        <Button
          disabled={!isDirty || !isValid}
          type='submit'
          className='btn btn-primary self-end'
        >
          {t.recipes.save}
        </Button>
      </form>
    </>
  )
}

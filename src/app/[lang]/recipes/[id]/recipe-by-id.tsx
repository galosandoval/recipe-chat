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
  const [imageRef, imageObservation] = useObervationObserver(observerOptions)
  const [endRef, endObservation] = useObervationObserver(observerOptions)
  const containerRef = useRef<HTMLDivElement>(null)

  // Memoize the intersection ratio calculation to prevent unnecessary re-renders
  const intersectionRatio = useMemo(
    () => imageObservation?.intersectionRatio ?? 0,
    [imageObservation?.intersectionRatio]
  )

  // Memoize the translateY calculation
  const translateY = useMemo(
    () => `${intersectionRatio * 20}%`,
    [intersectionRatio]
  )

  // Memoize the end intersection check
  const isIntersectingEnd = useMemo(
    () => endObservation?.isIntersecting,
    [endObservation?.isIntersecting]
  )
  const isPastEnd = isIntersectingEnd

  // Memoize the container height to prevent unnecessary re-renders
  const containerHeight = useMemo(() => {
    if (!isPastEnd && containerRef.current) {
      return containerRef.current.clientHeight
    }
    return 0
  }, [isPastEnd])

  return (
    <>
      <ParallaxContainer
        imageRef={imageRef}
        endRef={endRef}
        containerRef={containerRef}
      />
      <ImageWithTitleAndDescription
        data={data}
        translateY={translateY}
        imgHeight={containerHeight}
        isPastEnd={isPastEnd ?? false}
      />

      <div className='bg-base-100 relative z-10'>
        <StickyHeader
          name={name}
          isPastEnd={isPastEnd ?? false}
          containerHeight={containerHeight}
        />
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
    </>
  )
}

function StickyHeader({
  name,
  isPastEnd,
  containerHeight
}: {
  name: string
  isPastEnd: boolean
  containerHeight: number
}) {
  return (
    <div className='to-base-100/90 sticky top-0 flex items-center justify-center bg-transparent bg-gradient-to-t from-transparent py-5 backdrop-blur-sm'>
      <div
        className={cn(
          'text-base-content/90 bg-transparent text-lg font-bold opacity-0 transition-opacity duration-300',
          isPastEnd && containerHeight == 0 && 'opacity-100'
        )}
      >
        {name}
      </div>
    </div>
  )
}

function RecipeTime({
  prepTime,
  cookTime
}: {
  prepTime: string
  cookTime: string
}) {
  const t = useTranslations()
  return (
    <div className='stats mb-2 max-w-sm items-center shadow'>
      <div className='stat place-items-center'>
        <div className='stat-title'>{t.recipes.prepTime}</div>
        <div className='stat-value text-base whitespace-normal'>{prepTime}</div>
      </div>

      <div className='stat place-items-center'>
        <div className='stat-title'>{t.recipes.cookTime}</div>
        <div className='stat-value text-base whitespace-normal'>{cookTime}</div>
      </div>
    </div>
  )
}

function ImageWithTitleAndDescription({
  data,
  translateY,
  imgHeight,
  isPastEnd
}: {
  data: RecipeByIdData
  translateY: string
  imgHeight: number | undefined
  isPastEnd: boolean
}) {
  return (
    <>
      {data.imgUrl ? (
        <RecipeMetaDataWithImage
          url={data.imgUrl}
          translateY={translateY}
          imgHeight={imgHeight}
          isPastEnd={isPastEnd}
        />
      ) : (
        <UploadImageButton />
      )}
    </>
  )
}

function RecipeMetaDataWithImage({
  url,
  translateY,
  imgHeight,
  isPastEnd
}: {
  url: string
  translateY: string
  imgHeight: number | undefined
  isPastEnd: boolean
}) {
  console.log(imgHeight)
  if (!imgHeight && imgHeight !== 0) return null
  return (
    <div>
      <Image
        className={cn('absolute -z-10 h-full', isPastEnd && 'hidden')}
        src={url}
        alt='recipe'
        width={imgHeight * 0.75}
        height={imgHeight}
        priority
        style={{
          transform: `translateY(-${translateY})`
        }}
      />
      <RecipeMetaData translateY={translateY} />
    </div>
  )
}

function RecipeMetaData({ translateY }: { translateY: string }) {
  const utils = api.useUtils()
  const { id } = useParams()
  const data = utils.recipes.byId.getData({ id: id as string })

  if (!data) return null

  const { name, prepTime, cookTime, description } = data

  return (
    <div className='relative z-0 flex h-svh w-full flex-col justify-end'>
      <div className='flex-1'></div>
      <div
        className='sticky top-0 h-full flex-1 bg-gradient-to-b from-slate-900/15 to-slate-900'
        style={{
          transform: `translateY(-${translateY})`
        }}
      >
        <div className='glass-element h-full bg-transparent px-5 py-4'>
          <h2 className='text-2xl font-bold text-white/90'>{name}</h2>

          {prepTime && cookTime && (
            <div className='flex justify-center'>
              <RecipeTime prepTime={prepTime} cookTime={cookTime} />
            </div>
          )}
          {description && (
            <p className='bg-transparent text-white'>{description}</p>
          )}
        </div>
      </div>
    </div>
  )
}

function Instructions({ instructions }: { instructions: Instruction[] }) {
  const t = useTranslations()

  return (
    <>
      <h2 className='divider'>{t.recipes.instructions}</h2>
      <ol className='flex list-none flex-col gap-3 pl-0'>
        {instructions.map((i, index) => (
          <li key={i.id} className='bg-base-300 mt-0 mb-0 rounded p-4'>
            <h3 className='text-base-content mb-1 text-sm font-bold'>
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

'use client'

import {
  type ChangeEvent,
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback
} from 'react'
import { type Instruction } from '@prisma/client'
import { Button } from '~/components/button'
import { CameraIcon } from '~/components/icons'
import { type RouterOutputs, api } from '~/trpc/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslations } from '~/hooks/use-translations'
import { BlobAccessError, type PutBlobResult } from '@vercel/blob'
import { toast } from '~/components/toast'
import Image from 'next/image'
import { useNoSleep } from '~/hooks/use-no-sleep'
import { IngredientsCheckList } from './ingredients-check-list'
import { cn } from '~/utils/cn'
import { useObervationObserver } from '~/hooks/use-observation-observer'
import { useParams } from 'next/navigation'

export default function Recipe({
  data
}: {
  data: NonNullable<RouterOutputs['recipes']['byId']>
}) {
  useNoSleep()
  const { data: recipe } = api.recipes.byId.useQuery(
    { id: data.id },
    { initialData: data }
  )

  if (!recipe) return null

  return (
    <div className='relative flex h-full max-w-md flex-1 flex-col overflow-y-auto'>
      <FoundRecipe data={recipe} />
    </div>
  )
}

const observerOptions: IntersectionObserverInit = {
  root: null,
  rootMargin: '0px',
  threshold: Array.from({ length: 100 }, (_, i) => i / 100)
}

function FoundRecipe({
  data
}: {
  data: NonNullable<RouterOutputs['recipes']['byId']>
}) {
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
      <div
        ref={containerRef}
        className='absolute top-0 right-0 bottom-0 left-0 -z-50'
      >
        <div className='h-svh'></div>
        <div className='h-svh' ref={imageRef}></div>
        <div className='h-svh' ref={endRef}></div>
      </div>
      <ImageWithTitleAndDescription
        data={data}
        translateY={translateY}
        imgHeight={containerHeight}
        isPastEnd={isPastEnd ?? false}
      />

      <div className='bg-base-100 relative'>
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
        <div className='mx-auto flex flex-col items-center px-4 pb-4'>
          <div className='bg-base-100 flex flex-col'>
            {/* <p className='mb-2'>{description}</p> */}

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

// function ParallaxHero({
//   data
// }: {
//   data: NonNullable<RouterOutputs['recipes']['byId']>
// }) {

//   return (
//     <>
//       <div
//         ref={containerRef}
//         className='absolute top-0 right-0 bottom-0 left-0 -z-50'
//       >
//         <div className='h-svh w-full'></div>
//         <div className='h-svh w-full' ref={imageRef}></div>
//         <div className='h-svh w-full' ref={endRef}></div>
//       </div>
//       <ImageWithTitleAndDescription
//         data={data}
//         translateY={translateY}
//         imgHeight={containerHeight}
//         isPastEnd={isPastEnd ?? false}
//       />
//     </>
//   )
// }

function RecipeTime({
  prepTime,
  cookTime
}: {
  prepTime: string
  cookTime: string
}) {
  const t = useTranslations()
  return (
    <div className='stats mb-2 max-w-sm shadow'>
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
  data: NonNullable<RouterOutputs['recipes']['byId']>
  translateY: string
  imgHeight: number | undefined
  isPastEnd: boolean
}) {
  const utils = api.useContext()
  const t = useTranslations()

  const [uploadImgButtonLabel, setUploadImgButtonLabel] = useState<
    'selectImage' | 'uploadImage' | 'uploadingImage'
  >('selectImage')

  const { mutate: updateImgUrl } = api.recipes.updateImgUrl.useMutation({
    onMutate: async ({ id, imgUrl }) => {
      await utils.recipes.byId.cancel({ id })

      const previousData = utils.recipes.byId.getData({ id })

      if (!previousData) return previousData

      utils.recipes.byId.setData({ id }, (old) => {
        if (!old) return old

        return {
          ...old,
          imgUrl
        }
      })

      return { previousData }
    },

    onSuccess: async () => {
      await utils.recipes.byId.invalidate({ id: data.id })
      setUploadImgButtonLabel('selectImage')
    },

    onError: (error, _, context) => {
      setUploadImgButtonLabel('selectImage')

      const previousData = context?.previousData

      if (previousData && previousData) {
        utils.recipes.byId.setData({ id: data.id }, previousData)
      }

      toast.error(error.message)
    }
  })

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return

    const fileList = event.target.files

    if (fileList.length) {
      setUploadImgButtonLabel('uploadingImage')

      try {
        if (!fileList?.length) {
          throw Error(t.recipes.byId.noFile)
        }

        const file = fileList[0]

        const response = await fetch(`/api/upload?filename=${file.name}`, {
          method: 'POST',
          body: file
        })

        const newBlob = (await response.json()) as PutBlobResult

        updateImgUrl({ id: data.id, imgUrl: newBlob.url })
      } catch (error) {
        setUploadImgButtonLabel('selectImage')

        // handle a recognized error
        if (error instanceof BlobAccessError || error instanceof Error) {
          toast.error(error.message)
        } else if (error instanceof Error) {
          toast.error(error.message)
        } else {
          // handle an unrecognized error
          toast.error(t.error.somethingWentWrong)
        }
      }
    }

    setUploadImgButtonLabel('uploadImage')
  }

  return (
    <>
      {data.imgUrl ? (
        <RecipeMetaDataWithImage
          title={data.name}
          url={data.imgUrl}
          description={data.description}
          translateY={translateY}
          imgHeight={imgHeight}
          isPastEnd={isPastEnd}
          prepTime={data.prepTime ?? ''}
          cookTime={data.cookTime ?? ''}
        />
      ) : (
        <div className='gap flex flex-col items-center justify-center py-5'>
          <input
            id='file-input'
            type='file'
            name='file'
            className='invisible'
            onChange={handleFileChange}
          />
          <Button
            onClick={() => {
              const fileInput = document.querySelector(
                '#file-input'
              ) as HTMLInputElement | null

              if (fileInput) {
                fileInput.click()
              }
            }}
            className='btn btn-primary w-3/4'
          >
            <CameraIcon />
            {String(
              t.recipes.byId[
                uploadImgButtonLabel as keyof typeof t.recipes.byId
              ]
            )}
          </Button>
        </div>
      )}
    </>
  )
}

function RecipeMetaDataWithImage({
  title,
  url,
  description,
  translateY,
  imgHeight,
  isPastEnd,
  prepTime,
  cookTime
}: {
  title: string
  url: string
  description: string | null
  translateY: string
  imgHeight: number | undefined
  isPastEnd: boolean
  prepTime: string
  cookTime: string
}) {
  if (!imgHeight && imgHeight !== 0) return null
  return (
    <div>
      <Image
        className={cn('fixed -z-10 h-full object-cover', isPastEnd && 'hidden')}
        src={url}
        alt='recipe'
        width={imgHeight * 0.75}
        height={imgHeight}
        priority
        style={{
          transform: `translateY(-${translateY})`
        }}
      />
      <RecipeMetaData />
    </div>
  )
}

function RecipeMetaData() {
  const utils = api.useUtils()
  const { id } = useParams()
  const data = utils.recipes.byId.getData({ id: id as string })

  if (!data) return null

  const { name, prepTime, cookTime, description } = data

  return (
    <div className='flex h-svh w-full flex-col justify-end'>
      <div className='to-base-100 sticky top-0 h-1/2 bg-transparent bg-gradient-to-b from-transparent backdrop-blur-sm'>
        <h2 className='text-base-content/90 text-2xl font-bold'>{name}</h2>

        {prepTime && cookTime && (
          <RecipeTime prepTime={prepTime} cookTime={cookTime} />
        )}
        {description && <p className='text-base-content/90'>{description}</p>}
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

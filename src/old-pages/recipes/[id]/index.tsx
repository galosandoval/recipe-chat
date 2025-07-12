import { useRouter } from 'next/router'
import { type Ingredient, type Instruction } from '@prisma/client'
import { type ChangeEvent, useEffect, useState } from 'react'
import { Button } from '~/components/button'
import { useAddToList, useRecipe } from '~/hooks/use-recipe'
import { Checkbox } from '~/components/checkbox'
import { MyHead } from '~/components/head'
import NoSleep from 'nosleep.js'
import { ListBulletIcon, PlusIcon } from '~/components/icons'
import { ScreenLoader } from '~/components/loaders/screen'
import { type RouterInputs, type RouterOutputs, api } from '~/trpc/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslations } from '~/hooks/use-translations'
import { BlobAccessError, type PutBlobResult } from '@vercel/blob'
import toast from 'react-hot-toast'
import Image from 'next/image'

export default function RecipeByIdView() {
  const router = useRouter()
  const { id, name } = router.query

  useEffect(() => {
    const noSleep = new NoSleep()
    noSleep.enable()
    return () => {
      noSleep.disable()
    }
  }, [])

  return (
    <>
      <MyHead title={name as string} />
      <div className='overflow-y-auto pt-16'>
        <RecipeById id={id as string} />
      </div>
    </>
  )
}

export function RecipeById({ id }: { id: string }) {
  const t = useTranslations()

  const { data, status } = useRecipe(id)

  if (status === 'error')
    return <div className=''>{t.error.somethingWentWrong}</div>

  if (status === 'success') {
    if (!data) return null

    return <FoundRecipe data={data} />
  }

  return <ScreenLoader />
}

type Checked = Record<string, boolean>

function FoundRecipe({
  data
}: {
  data: NonNullable<RouterOutputs['recipes']['byId']>
}) {
  const t = useTranslations()

  const { mutate, isPending } = useAddToList()

  const {
    ingredients,
    address,
    author,
    description,
    instructions,
    prepTime,
    cookTime,
    notes,
    imgUrl,
    id
  } = data

  const initialChecked: Checked = {}
  ingredients.forEach((i) => {
    if (i.name.endsWith(':')) return
    initialChecked[i.id] = true
  })

  const [checked, setChecked] = useState<Checked>(() => initialChecked)
  const [addedToList, setAddedToList] = useState(false)
  const router = useRouter()

  const handleCheck = (event: ChangeEvent<HTMLInputElement>) => {
    setChecked((state) => ({
      ...state,
      [event.target.id]: event.target.checked
    }))
  }

  const allChecked = Object.values(checked).every(Boolean)
  const noneChecked = Object.values(checked).every((i) => !i)
  const handleCheckAll = () => {
    for (const id in checked) {
      if (allChecked) {
        setChecked((state) => ({ ...state, [id]: false }))
      } else {
        setChecked((state) => ({ ...state, [id]: true }))
      }
    }
  }

  let goToListTimer: ReturnType<typeof setTimeout> | undefined = undefined
  const handleAddToList = () => {
    const checkedIngredients = ingredients.filter((i) => checked[i.id])
    const newList: RouterInputs['lists']['upsert'] = checkedIngredients
    mutate(newList)
    setAddedToList(true)

    goToListTimer = setTimeout(() => {
      setAddedToList(false)
    }, 6000)
  }

  let renderAddress: React.ReactNode = null
  if (address) {
    renderAddress = (
      <a href={address} className=''>
        {address}
      </a>
    )
  }

  let renderAuthor: React.ReactNode = null
  if (author) {
    renderAuthor = (
      <a href={author} className=''>
        {author}
      </a>
    )
  }

  const handleGoToList = () => {
    router.push('/list')
  }

  useEffect(() => {
    return () => clearTimeout(goToListTimer)
  }, [goToListTimer])

  return (
    <div className='prose mx-auto flex flex-col items-center pb-4'>
      <div className='flex flex-col'>
        <ImageUpload id={id} url={imgUrl} />

        <div className='px-4'>
          {renderAddress}
          {renderAuthor}
        </div>
      </div>

      <div className='flex flex-col px-4'>
        <p className='mb-2'>{description}</p>

        {prepTime && cookTime && (
          <div className='stats mb-2 shadow'>
            <div className='stat place-items-center'>
              <div className='stat-title'>{t.recipes.prepTime}</div>
              <div className='stat-value text-base'>{prepTime}</div>
            </div>

            <div className='stat place-items-center'>
              <div className='stat-title'>{t.recipes.cookTime}</div>
              <div className='stat-value text-base'>{cookTime}</div>
            </div>
          </div>
        )}
        <div className='mb-4'>
          <Button
            className={`${
              addedToList ? 'btn-accent' : 'btn-primary'
            } btn w-full gap-2`}
            disabled={noneChecked}
            onClick={addedToList ? handleGoToList : handleAddToList}
            isLoading={isPending}
          >
            {addedToList ? <ListBulletIcon /> : <PlusIcon />}
            {addedToList ? t.recipes.byId.goToList : t.recipes.byId.addToList}
          </Button>
        </div>
        <div className=''>
          <div>
            <Checkbox
              id='check-all'
              label={
                allChecked
                  ? t.recipes.byId.deselectAll
                  : t.recipes.byId.selectAll
              }
              checked={allChecked}
              onChange={handleCheckAll}
            />
          </div>

          <Ingredients
            checked={checked}
            handleCheck={handleCheck}
            ingredients={ingredients}
          />
        </div>
        <div className='pt-4'>
          <Instructions instructions={instructions} />
        </div>
        <Notes notes={notes} id={id} />
      </div>
    </div>
  )
}

function ImageUpload({ id, url }: { id: string; url: string | null }) {
  const utils = api.useContext()
  const t = useTranslations()

  const [uploadImgButtonLabel, setUploadImgButtonLabel] = useState<
    'select-image' | 'upload-image' | 'uploading-image'
  >('select-image')

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
      await utils.recipes.byId.invalidate({ id })
      setUploadImgButtonLabel('select-image')
    },

    onError: (error, _, context) => {
      setUploadImgButtonLabel('select-image')

      const previousData = context?.previousData

      if (previousData && previousData) {
        utils.recipes.byId.setData({ id }, previousData)
      }

      toast.error(error.message)
    }
  })

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return

    const fileList = event.target.files

    if (fileList.length) {
      setUploadImgButtonLabel('uploading-image')

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

        updateImgUrl({ id, imgUrl: newBlob.url })
      } catch (error) {
        setUploadImgButtonLabel('select-image')

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

    setUploadImgButtonLabel('upload-image')
  }

  return (
    <>
      {url ? (
        <Image
          className='mx-auto rounded'
          src={url}
          alt='recipe'
          width={300}
          height={300}
        />
      ) : (
        <div className='gap flex flex-col justify-center px-4 py-5'>
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
            className='btn btn-primary'
          >
            {/* camera icon */}
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
              className='h-6 w-6'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z'
              />
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z'
              />
            </svg>
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

function Ingredients({
  ingredients,
  checked,
  handleCheck
}: {
  ingredients: Ingredient[]
  checked: Checked
  handleCheck: (event: ChangeEvent<HTMLInputElement>) => void
}) {
  const t = useTranslations()

  return (
    <>
      <h2 className='divider'>{t.recipes.ingredients}</h2>
      <div>
        {ingredients.map((i) => {
          if (i.name.endsWith(':')) {
            return (
              <h3 className='divider text-sm' key={i.id}>
                {i.name.slice(0, -1)}
              </h3>
            )
          }

          return (
            <Checkbox
              id={i.id.toString()}
              checked={checked[i.id]}
              onChange={handleCheck}
              label={i.name}
              key={i.id}
            />
          )
        })}
      </div>
    </>
  )
}

function Instructions({ instructions }: { instructions: Instruction[] }) {
  const t = useTranslations()

  return (
    <>
      <h2 className='divider'>{t.recipes.instructions}</h2>
      <ol className='flex list-none flex-col gap-4 pl-0'>
        {instructions.map((i, index, array) => (
          <li key={i.id} className='mb-0 mt-0 bg-base-300 px-7 pb-2'>
            <h3>
              {t.recipes.step} {index + 1}/{array.length}
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
        className='flex flex-col gap-2'
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

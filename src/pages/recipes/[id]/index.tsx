import { useRouter } from 'next/router'
import { Ingredient, Instruction } from '@prisma/client'
import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { Button } from 'components/button'
import { useAddToList, useRecipe } from 'hooks/use-recipe'
import { Checkbox } from 'components/checkbox'
import { MyHead } from 'components/head'
import NoSleep from 'nosleep.js'
import { ListBulletIcon, PlusIcon } from 'components/icons'
import { ScreenLoader } from 'components/loaders/screen'
import { RouterInputs, RouterOutputs, api } from 'utils/api'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { GetServerSideProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'hooks/use-translation'
import { PutBlobResult } from '@vercel/blob'
import toast from 'react-hot-toast'
import Image from 'next/image'

export const getServerSideProps = (async ({ locale }) => {
  const localeFiles = ['common']

  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', localeFiles))
      // Will be passed to the page component as props
    }
  }
}) satisfies GetServerSideProps

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
      <div className='pt-16'>
        <RecipeById id={id as string} />
      </div>
    </>
  )
}

export function RecipeById({ id }: { id: string }) {
  const t = useTranslation()

  const { data, status } = useRecipe(id)

  if (status === 'error')
    return <div className=''>{t('error.something-went-wrong')}</div>

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
  data: NonNullable<RouterOutputs['recipe']['byId']>
}) {
  const t = useTranslation()

  const { mutate, isLoading } = useAddToList()

  const {
    ingredients,
    address,
    author,
    description,
    instructions,
    prepTime,
    cookTime,
    notes,
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
    const newList: RouterInputs['list']['upsert'] = checkedIngredients
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

  const inputFileRef = useRef<HTMLInputElement>(null)
  const [blobUrl, setBlobUrl] = useState<string | null>(null)

  useEffect(() => {
    return () => clearTimeout(goToListTimer)
  }, [goToListTimer])

  return (
    <div className='container prose mx-auto flex flex-col items-center pb-4'>
      <div className='flex flex-col'>
        <form
          className='gap flex flex-col py-5'
          onSubmit={async (event) => {
            event.preventDefault()
            console.log(inputFileRef.current?.files)
            if (!inputFileRef.current?.files) {
              toast.error('No file selected')
              return
            }

            const file = inputFileRef.current.files[0]

            console.log(file)

            const response = await fetch(`/api/upload?filename=${file.name}`, {
              method: 'POST',
              body: file
            })

            console.log(response)

            const newBlob = (await response.json()) as PutBlobResult
            console.log(newBlob)
            console.log(newBlob.url)
            setBlobUrl(newBlob.url)
          }}
        >
          <label className='label' htmlFor='file-input'>
            Add a photo
          </label>
          <input
            id='file-input'
            type='file'
            className='file-input file-input-bordered file-input-primary w-full max-w-xs'
            ref={inputFileRef}
          />

          {blobUrl && (
            <Image src={blobUrl} alt='recipe' width={200} height={200} />
          )}
          <Image
            src={
              'https://nvpvglkh9iqe2xny.public.blob.vercel-storage.com/profile-pic-CO0nUYaGnQWg5hfnUjNjcYcwEARDWf.jpeg'
            }
            alt='me'
            width={200}
            height={200}
          />

          <div className='mx-auto pt-4'>
            <Button className='btn btn-primary' type='submit'>
              Save image
            </Button>
          </div>
        </form>
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
              <div className='stat-title'>{t('recipes.prep-time')}</div>
              <div className='stat-value text-base'>{prepTime}</div>
            </div>

            <div className='stat place-items-center'>
              <div className='stat-title'>{t('recipes.cook-time')}</div>
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
            isLoading={isLoading}
          >
            {addedToList ? <ListBulletIcon /> : <PlusIcon />}
            {addedToList
              ? t('recipes.by-id.go-to-list')
              : t('recipes.by-id.add-to-list')}
          </Button>
        </div>
        <div className=''>
          <div>
            <Checkbox
              id='check-all'
              label={
                allChecked
                  ? t('recipes.by-id.deselect-all')
                  : t('recipes.by-id.select-all')
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

function Ingredients({
  ingredients,
  checked,
  handleCheck
}: {
  ingredients: Ingredient[]
  checked: Checked
  handleCheck: (event: ChangeEvent<HTMLInputElement>) => void
}) {
  const t = useTranslation()

  return (
    <>
      <h2 className='divider'>{t('recipes.ingredients')}</h2>
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
  const t = useTranslation()

  return (
    <>
      <h2 className='divider'>{t('recipes.instructions')}</h2>
      <ol className='flex list-none flex-col gap-4 pl-0'>
        {instructions.map((i, index, array) => (
          <li key={i.id} className='mb-0 mt-0 bg-base-300 px-7 pb-2'>
            <h3>
              {t('recipes.step')} {index + 1}/{array.length}
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
  const t = useTranslation()

  const utils = api.useContext()
  const { mutate } = api.recipe.addNotes.useMutation({
    onSuccess() {
      utils.recipe.byId.invalidate({ id })
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
        <h2 className='divider'>{t('recipes.notes')}</h2>
        <p className='whitespace-pre-line'>{notes}</p>
      </>
    )
  }

  return (
    <>
      <h2 className='divider'>{t('recipes.notes')}</h2>
      <form
        onSubmit={handleSubmit(({ notes }) => {
          mutate({ id, notes })
        })}
        className='flex flex-col gap-2'
      >
        <textarea
          className='textarea textarea-primary w-full resize-none'
          placeholder={t('recipes.by-id.placeholder')}
          {...register('notes')}
        ></textarea>
        <Button
          disabled={!isDirty || !isValid}
          type='submit'
          className='btn btn-primary self-end'
        >
          {t('recipes.save')}
        </Button>
      </form>
    </>
  )
}

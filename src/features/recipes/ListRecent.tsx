import Image from 'next/image'
import { api } from '../../utils/api'
import defaultRecipeJpeg from '../../assets/default-recipe.jpeg'
import { Recipe } from '@prisma/client'
import { CreateRecipePopover } from './Create'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'

export function ListRecent() {
  const router = useRouter()
  const session = useSession()

  const { data, isSuccess } = api.recipes.entity.useQuery(
    { userId: parseInt(session.data?.user.id || '') },
    {
      onError: (err) => {
        if (err.data?.code === 'UNAUTHORIZED') {
          void router.push('/')
        }
      }
    }
  )

  if (isSuccess) {
    return (
      <div className='container mx-auto'>
        <h1>Recent Recipes</h1>
        <div className='grid grid-cols-4 gap-5'>
          <CardList data={Object.values(data)} />
        </div>
      </div>
    )
  }
  return <p>Loading...</p>
}

function CardList({ data }: { data: Recipe[] }) {
  const toReturn: JSX.Element[] = [
    <CreateRecipeCard key='create-recipe-card' />
  ]
  toReturn.push(...data.map((recipe) => <Card key={recipe.id} data={recipe} />))
  return <>{toReturn}</>
}

function Card({ data }: { data: Recipe }) {
  let address: React.ReactNode = null
  if (data.address) {
    address = (
      <a href={data.address} className=''>
        {data.address}
      </a>
    )
  }

  let author: React.ReactNode = null
  if (data.author) {
    author = <p className=''>{data.author}</p>
  }

  const name = data.name.replaceAll('&', 'and')

  return (
    <Link
      href={`/recipes/${data.id}?name=${name}`}
      key={data.id}
      className='flex cursor-default flex-col overflow-hidden rounded bg-white shadow-xl dark:bg-slate-800'
    >
      <div className='w-full'>
        <Image
          src={data.imgUrl || defaultRecipeJpeg}
          alt='recipe'
          className='object-top'
          priority
        />
      </div>
      <div className='flex flex-col'>
        {address}
        {author}
        <h3 className=''>{data.name}</h3>
      </div>
    </Link>
  )
}

function CreateRecipeCard() {
  return (
    <div className='flex flex-col overflow-hidden rounded bg-white shadow-xl dark:bg-slate-800'>
      <CreateRecipePopover />
    </div>
  )
}

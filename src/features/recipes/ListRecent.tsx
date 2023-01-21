import Image from 'next/image'
import { trpc } from '../../utils/trpc'
import defaultRecipeJpeg from '../../assets/default-recipe.jpeg'
import { Recipe } from '@prisma/client'
import { CreateRecipePopover } from './Create'
import Link from 'next/link'

export function ListRecent() {
  const { data, isSuccess } = trpc.recipeEntity.useQuery({ userId: 1 })

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
  return <>{toReturn.map((element) => element)}</>
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

  return (
    <Link
      href={`/recipes/${data.id}?name=${data.name}`}
      key={data.id}
      className='rounded bg-white dark:bg-slate-800 flex flex-col shadow-xl overflow-hidden cursor-default'
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
    <div className='rounded bg-white dark:bg-slate-800 flex flex-col shadow-xl overflow-hidden'>
      <CreateRecipePopover />
    </div>
  )
}

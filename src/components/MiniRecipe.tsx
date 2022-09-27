import Image from 'next/image'
import React from 'react'
import { MiniItemType } from '../pages'

type Props = { recipe: MiniItemType }

function MiniRecipe({ recipe }: Props) {
  return (
    <div
      key={recipe.name}
      className='card flex flex-col p-2 h-48 items-center text-left justify-start'
    >
      <Image
        src={recipe.photo[0]!}
        alt={recipe.name}
        height='100px'
        width='100px'
        layout='fixed'
        className='rounded-md'
      />
      <h3 className='my-auto'>{recipe.name}</h3>
    </div>
  )
}

export default MiniRecipe

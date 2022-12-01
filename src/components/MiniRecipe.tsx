import React from 'react'
import { MiniItemType } from '../pages'

type Props = { recipe: MiniItemType }

function MiniRecipe({ recipe }: Props) {
  return (
    <div
      key={recipe.name}
      className='card flex flex-col p-2 h-48 items-center text-left justify-start'
    >
      <h3 className='my-auto'>{recipe.name}</h3>
    </div>
  )
}

export default MiniRecipe

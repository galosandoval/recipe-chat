import React from 'react'
import { MiniItemType } from '../pages'

function MiniList({ item }: { item: MiniItemType }) {
  return (
    <div className='flex flex-col gap-2 w-1/2'>
      <h1 className='text-2xl'>{item.name}</h1>
      <div className='flex flex-col gap-5'>
        <h3 className=''>{item.name}</h3>
      </div>
    </div>
  )
}

export default MiniList

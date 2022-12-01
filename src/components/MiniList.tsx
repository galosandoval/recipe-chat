import Image from 'next/image'
import React from 'react'
import { MiniListType } from '../pages'

function MiniList({ list }: { list: MiniListType }) {
  return (
    <div className='flex flex-col gap-2 w-1/2'>
      <h1 className='text-2xl'>{list.name}</h1>
      <div className='flex flex-col gap-5'>
        {list.items.map((item) => (
          <div key={item.id} className='card flex justify-between'>
            <h3 className='self-center px-5'>{item.name}</h3>
            {typeof item.photo !== 'string' &&
              item.photo.map((url) => (
                <Image
                  src={url}
                  key={url}
                  alt={item.name}
                  height='100px'
                  width='100px'
                  layout='fixed'
                />
              ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default MiniList

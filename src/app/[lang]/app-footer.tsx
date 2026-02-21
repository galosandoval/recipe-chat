'use client'

import { usePathname } from 'next/navigation'
import { AddToListForm } from './list/add-to-list-form'
import { AddToPantryForm } from './pantry/add-to-pantry-form'
import { useAddToPantry } from './pantry/pantry-by-user-id'

export function AppFooter() {
  const pathname = usePathname() ?? ''

  if (pathname.includes('/list')) {
    return (
      <footer className='sticky bottom-0 z-20 shrink-0'>
        <AddToListForm />
      </footer>
    )
  }

  if (pathname.includes('/pantry')) {
    return (
      <footer className='sticky bottom-0 z-20 shrink-0'>
        <PantryFooter />
      </footer>
    )
  }

  return null
}

function PantryFooter() {
  const { mutate: addToPantry } = useAddToPantry()
  return <AddToPantryForm addToPantry={addToPantry} />
}

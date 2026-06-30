'use client'

import { Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { AddToListForm } from './list/add-to-list-form'
import { AddToPantryForm } from './pantry/add-to-pantry-form'
import { useAddToPantry } from './pantry/pantry-by-user-id'

export function AppFooter() {
  const pathname = usePathname() ?? ''

  if (!pathname.includes('/lists')) {
    return null
  }

  return (
    <footer className='sticky bottom-0 z-20 shrink-0'>
      <Suspense fallback={<AddToListForm />}>
        <ListsFooter />
      </Suspense>
    </footer>
  )
}

// The footer input follows the active `/lists` tab: pantry input on the Pantry
// tab, list input otherwise (default).
function ListsFooter() {
  const searchParams = useSearchParams()

  if (searchParams.get('tab') === 'pantry') {
    return <PantryFooter />
  }

  return <AddToListForm />
}

function PantryFooter() {
  const { mutate: addToPantry } = useAddToPantry()
  return <AddToPantryForm addToPantry={addToPantry} />
}

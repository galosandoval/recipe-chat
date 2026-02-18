'use client'

import { usePathname } from 'next/navigation'
import { SearchBar } from './recipes/search-bar'
import { AddToListForm } from './list/add-to-list-form'
import { AddToPantryForm } from './pantry/add-to-pantry-form'
import { useAddToPantry } from './pantry/pantry-by-user-id'

function isRecipeDetailPage(pathname: string) {
  const parts = pathname.split('/').filter(Boolean)
  return parts[1] === 'recipes' && parts[2] != null && parts[2].length > 0
}

export function AppFooter() {
  const pathname = usePathname() ?? ''

  if (isRecipeDetailPage(pathname)) {
    return null
  }

  if (pathname.includes('/recipes')) {
    return (
      <footer className='sticky bottom-0 z-20 shrink-0'>
        <SearchBar />
      </footer>
    )
  }

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

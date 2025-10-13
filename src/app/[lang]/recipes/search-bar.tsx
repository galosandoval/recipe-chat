import { SearchIcon, XCircleIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useRef, type ChangeEvent } from 'react'
import { Button } from '~/components/button'
import { Input } from '~/components/ui/input'
import { useTranslations } from '~/hooks/use-translations'
import { recipesStore } from '~/stores/recipes-store'

export const SearchBar = React.memo(function SearchBar() {
  const t = useTranslations()
  const inputRef = useRef<HTMLInputElement>(null)
  const { search, setSearch } = recipesStore()
  const router = useRouter()

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value)
  }

  const handleSearchButtonClick = !!search
    ? () =>
        handleChange({
          target: { value: '' }
        } as ChangeEvent<HTMLInputElement>)
    : () => inputRef.current?.focus()

  useEffect(() => {
    if (search) {
      router.push(`/recipes?search=${search}`)
    } else {
      router.push('/recipes')
    }
  }, [search])

  useEffect(() => {
    inputRef.current?.focus()
  }, [search])

  useEffect(() => {
    if (search && inputRef.current) {
      inputRef.current?.focus()
    }
  }, [search, inputRef.current])

  return (
    <div className='flex w-full items-center sm:top-[5.75rem]'>
      <div className='mx-auto flex w-full max-w-2xl items-center py-1 sm:mb-2 sm:rounded'>
        <div className='flex w-full px-2 py-1'>
          <Input
            type='text'
            value={search}
            onChange={handleChange}
            placeholder={t.recipes.search}
            ref={inputRef}
          />
        </div>
        <div className='pr-2'>
          <Button type='button' onClick={handleSearchButtonClick}>
            {!!search ? <XCircleIcon /> : <SearchIcon />}
          </Button>
        </div>
      </div>
    </div>
  )
})

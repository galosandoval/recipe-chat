import React, { type ChangeEvent, type RefObject } from 'react'
import { MagnifyingGlassCircleIcon, XCircleIcon } from '~/components/icons'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { useTranslations } from '~/hooks/use-translations'

export const SearchBarWrapper = React.memo(function SearchBarWrapper({
  children,
  handleChange,
  inputRef,
  search,
  handleSearchButtonClick
}: {
  children: React.ReactNode
  handleChange: (event: ChangeEvent<HTMLInputElement>) => void
  inputRef: RefObject<HTMLInputElement | null>
  search: string
  handleSearchButtonClick: () => void
}) {
  return (
    <div className='relative flex flex-col overflow-y-auto px-2 pt-14'>
      <SearchBar
        handleChange={handleChange}
        handleSearchButtonClick={handleSearchButtonClick}
        inputRef={inputRef}
        search={search}
      />
      {children}
    </div>
  )
})

const SearchBar = React.memo(function SearchBar({
  inputRef,
  search,
  handleSearchButtonClick,
  handleChange
}: {
  inputRef: RefObject<HTMLInputElement | null>
  search: string
  handleSearchButtonClick: () => void
  handleChange: (event: ChangeEvent<HTMLInputElement>) => void
}) {
  const t = useTranslations()

  return (
    <div className='fixed top-[4.68rem] right-0 left-0 z-10 flex w-full items-center md:rounded-md'>
      <div className='glass-element mx-auto flex w-full items-center py-1 sm:mb-2 sm:rounded-lg'>
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
            {!!search ? <XCircleIcon /> : <MagnifyingGlassCircleIcon />}
          </Button>
        </div>
      </div>
    </div>
  )
})

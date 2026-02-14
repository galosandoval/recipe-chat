'use client'

import { api } from '~/trpc/react'

export function ParserTestClient() {
  const { data, isLoading, error } = api.ingredients.getParsedIngredients.useQuery()

  if (isLoading) return <p className='text-muted-foreground'>Loading…</p>
  if (error) return <p className='text-destructive'>Error: {error.message}</p>
  if (!data?.length)
    return (
      <p className='text-muted-foreground'>
        No ingredients yet. Add recipes or list items, then come back.
      </p>
    )

  return (
    <pre className='bg-muted text-foreground overflow-auto rounded-lg border p-4 text-xs'>
      {JSON.stringify(data, null, 2)}
    </pre>
  )
}

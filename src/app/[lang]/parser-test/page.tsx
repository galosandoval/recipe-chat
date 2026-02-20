import { HydrateClient } from '~/trpc/server'
import { auth } from '~/server/auth'
import { redirect } from 'next/navigation'
import { ParserTestClient } from './parser-test-client'

export default async function ParserTestPage() {
  const session = await auth()
  if (!session?.user.id) {
    return redirect('/')
  }

  return (
    <HydrateClient>
      <main className='mx-auto max-w-4xl p-6'>
        <h1 className='text-foreground mb-4 text-2xl font-bold'>
          Ingredient parser test
        </h1>
        <p className='text-muted-foreground mb-4 text-sm'>
          All your ingredients with parsed fields. Open DevTools → Network, find
          the <code className='rounded bg-muted px-1'>getParsedIngredients</code>{' '}
          request to see the raw JSON.
        </p>
        <ParserTestClient />
      </main>
    </HydrateClient>
  )
}

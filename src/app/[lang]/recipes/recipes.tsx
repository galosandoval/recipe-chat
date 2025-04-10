'use client'

import type { FetchStatus } from '@tanstack/react-query'
import type { Recipe } from '@prisma/client'
import type { QueryStatus } from '@tanstack/react-query'
import { Fragment, useEffect, useRef, useState, type ChangeEvent } from 'react'
import { api } from '~/trpc/react'
import { useTranslations } from '~/hooks/use-translations'
import { Link } from 'lucide-react'

export function Recipes() {
	// const { ref: inViewRef, inView } = useInView()

	const [search, setSearch] = useState('')

	const { data, status, hasNextPage, fetchNextPage, fetchStatus } =
		api.recipes.infiniteRecipes.useInfiniteQuery(
			{
				limit: 10,
				search: 'debouncedSearch'
			},
			{
				getNextPageParam: (lastPage) => lastPage.nextCursor
			}
		)

	const inputRef = useRef<HTMLInputElement>(null)

	const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
		setSearch(event.target.value)
	}

	const handleSearchButtonClick = !!search
		? () => setSearch('')
		: () => inputRef.current?.focus()

	// useEffect(() => {
	//   if (inView && hasNextPage) {
	//     fetchNextPage()
	//   }
	// }, [inView, hasNextPage])

	const pages = data?.pages ?? []

	return (
		<Pages
			pages={pages}
			search={search}
			status={status}
			fetchStatus={fetchStatus}
		/>
	)
}

function Pages({
	search,
	pages,
	status,
	fetchStatus
}: {
	pages: {
		items: Recipe[]
		nextCursor: string | undefined
	}[]
	search: string
	status: QueryStatus
	fetchStatus: FetchStatus
}) {
	const t = useTranslations()

	// if (status === 'loading') {
	// 	return <ScreenLoader />
	// }

	return (
		<div className='mx-auto grid max-w-4xl grid-cols-2 gap-5 pb-20 pt-4 sm:grid-cols-4'>
			{pages.map((page, i) => (
				<Fragment key={i}>
					<div className='prose col-span-2 sm:col-span-4'>
						<p>
							{t.recipes.noRecipes.message}
							<Link className='link' href='/chat'>
								{t.recipes.noRecipes.link}
							</Link>
						</p>
					</div>
				</Fragment>
			))}
		</div>
	)
}

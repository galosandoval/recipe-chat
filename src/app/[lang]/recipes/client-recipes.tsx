'use client'

import type { FetchStatus } from '@tanstack/react-query'
import type { Recipe } from '@prisma/client'
import type { QueryStatus } from '@tanstack/react-query'
import { Fragment, useEffect, useRef, useState, type ChangeEvent } from 'react'
import { api } from '~/trpc/react'
import { useTranslations } from '~/hooks/use-translations'
import type { InfiniteRecipes, LinkedDataRecipeField } from '~/schemas/recipes'
import Link from 'next/link'
import Image from 'next/image'
import { z } from 'zod'
import { FormLoader } from '~/components/loaders/form'
import { Button } from '~/components/ui/button'
import { PlusIcon, Save } from 'lucide-react'
import { Modal } from '~/components/modal'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { DialogTitle } from '~/components/ui/dialog'
import { ErrorMessage } from '~/components/error-message-content'
import { CreateRecipe } from './create-recipe'
import { Card } from '~/components/ui/card'
import { RecipeFallbackSVG } from '~/components/icons'

export function ClientRecipes({
	initialRecipes
}: {
	initialRecipes: InfiniteRecipes
}) {
	// const { ref: inViewRef, inView } = useInView()

	const [search, setSearch] = useState('')

	const { data, status, hasNextPage, fetchNextPage, fetchStatus } =
		api.recipes.infiniteRecipes.useInfiniteQuery(
			{
				limit: 10,
				search
			},
			{
				getNextPageParam: (lastPage) => lastPage.nextCursor,
				initialData: {
					pages: [initialRecipes],
					pageParams: [null]
				},
				initialCursor: initialRecipes.nextCursor
			}
		)
	console.log('recipes data', data)
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
		<div className='mx-auto grid max-w-4xl grid-cols-2 gap-5 pb-2 pt-4 sm:grid-cols-4'>
			{pages.map((page, i) => (
				<Fragment key={i}>
					{page.items.length > 0 ? (
						<RecipeCards data={page.items} search={search} />
					) : (
						<div className='col-span-2 sm:col-span-4'>
							<p>
								{t.recipes.noRecipes.message}
								<Link className='link' href='/chat'>
									{t.recipes.noRecipes.link}
								</Link>
							</p>
						</div>
					)}
				</Fragment>
			))}
		</div>
	)
}

function RecipeCards({ data, search }: { data: Recipe[]; search: string }) {
	let sortedData = data.sort((a, b) => {
		if (a.name < b.name) {
			return -1
		}
		if (a.name > b.name) {
			return 1
		}
		return 0
	})

	if (search) {
		sortedData = sortedData.filter((recipe) =>
			recipe.name.toLowerCase().includes(search.toLowerCase())
		)
	}

	return (
		<>
			{sortedData.map((recipe) => (
				<RecipeCard key={recipe.id} data={recipe} />
			))}
		</>
	)
}

function RecipeCard({ data }: { data: Recipe }) {
	const { mutate } = api.recipes.updateLastViewedAt.useMutation()

	let address: React.ReactNode = null
	if (data.address) {
		address = (
			<a href={data.address} className=''>
				{data.address}
			</a>
		)
	}

	let author: React.ReactNode = null
	if (data.author) {
		author = <p className=''>{data.author}</p>
	}

	const handleUpdateLastViewedAt = () => {
		mutate(data.id)
	}

	return (
		<Link
			href={`/recipes/${data.id}?name=${encodeURIComponent(data.name)}`}
			key={data.id}
			className='col-span-1'
			onClick={handleUpdateLastViewedAt}
		>
			<Card className='overflow-hidden'>
				<div className='relative w-full rounded-lg shadow-xl'>
					{data.imgUrl ? (
						<div className='w-full'>
							<div className='relative h-52'>
								<Image
									className='object-fill sm:object-contain'
									src={data.imgUrl}
									alt='recipe'
									fill
									sizes='(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 33vw'
								/>
							</div>
						</div>
					) : (
						<div className='bg-primary-content'>
							<RecipeFallbackSVG />
						</div>
					)}
					<div className='absolute top-0 flex w-full flex-col overflow-hidden rounded-t-lg bg-muted/20 p-3 backdrop-blur-md'>
						<Save />
					</div>
				</div>
			</Card>
			<h3 className='text-base'>{data.name}</h3>
		</Link>
	)
}

const recipeUrlSchema = (errorMessage: string) =>
	z.object({
		url: z.string().url(errorMessage)
	})

export type RecipeUrlSchemaType = z.infer<ReturnType<typeof recipeUrlSchema>>

export function UploadRecipeUrlForm({
	onSubmit
}: {
	onSubmit: (values: RecipeUrlSchemaType) => void
}) {
	const t = useTranslations()

	const {
		register,
		handleSubmit,
		formState: { errors }
	} = useForm<RecipeUrlSchemaType>({
		resolver: zodResolver(recipeUrlSchema(t.recipes.enterUrl))
	})

	return (
		<>
			<DialogTitle className='mt-0'>{t.recipes.upload}</DialogTitle>
			<form onSubmit={handleSubmit(onSubmit)} className=''>
				<div className='prose mt-2 flex flex-col gap-1'>
					<label htmlFor='url' className='label'>
						<span className='label-text'>{t.recipes.paste}</span>
					</label>
					<input
						{...register('url')}
						className='input input-bordered select-auto'
						autoFocus
					/>
					<ErrorMessage errors={errors} name='url' />
				</div>
				<div className='mt-4'>
					<Button className='btn btn-primary w-full' type='submit'>
						{t.recipes.name}
					</Button>
				</div>
			</form>
		</>
	)
}

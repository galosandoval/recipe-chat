import type { MutationStatus } from '@tanstack/react-query'
import { useState } from 'react'
import { Button } from '~/components/button'
import { ChevronDownIcon, UserCircleIcon } from '~/components/icons'
import { useFiltersByUser } from '~/components/recipe-filters'
import { transformContentToRecipe } from '~/hooks/use-chat'
import { useTranslations } from '~/hooks/use-translations'
import type { Message as MessageType } from '~/schemas/chats'
import { cn } from '~/utils/cn'

export const Message = function InnerMessage({
	message,
	isStreaming,
	// filters,
	handleGoToRecipe,
	handleSaveRecipe,
	saveRecipeStatus
}: {
	message: MessageType
	isStreaming: boolean
	saveRecipeStatus: MutationStatus
	// filters: Filter[]
	handleGoToRecipe: ({
		recipeId,
		recipeName
	}: {
		recipeId: string | null
		recipeName: string
	}) => void
	handleSaveRecipe: ({
		content,
		messageId
	}: {
		content: string
		messageId?: string | undefined
	}) => void
}) {
	if (message.role === 'assistant') {
		return (
			<AssistantMessage
				message={message}
				handleGoToRecipe={handleGoToRecipe}
				handleSaveRecipe={handleSaveRecipe}
				isStreaming={isStreaming}
				saveRecipeStatus={saveRecipeStatus}
			/>
		)
	}

	return <UserMessage message={message} />
}

function UserMessage({ message }: { message: MessageType }) {
	return (
		<div className='flex flex-col items-center self-center p-4'>
			<div className='prose mx-auto w-full'>
				<div className='flex justify-end gap-2'>
					<div className='flex flex-col items-end'>
						<p className='mb-0 mt-0 whitespace-pre-line'>
							{message?.content || ''}
						</p>
					</div>
					{/* <div> TODO: Add user avatar
						<Avatar />
					</div> */}
				</div>
				<ActiveFilters />
			</div>
		</div>
	)
}

function ActiveFilters() {
	const { data: filters, status, fetchStatus } = useFiltersByUser()
	const t = useTranslations()

	if (fetchStatus === 'idle') {
		return null
	}

	if (status === 'pending') {
		return <div>{t.loading.screen}</div>
	}

	if (status === 'error' || !filters) {
		return <div>{t.error.somethingWentWrong}</div>
	}
	const activeFilters = filters.filter((f) => f.checked)

	if (activeFilters.length === 0) {
		return null
	}

	return (
		<div className='flex gap-2 pt-2'>
			<h3 className='mb-0 mt-0 text-sm'>{t.filters.title}:</h3>
			{activeFilters.map((f) => (
				<div className='badge badge-primary badge-outline' key={f.id}>
					{f.name}
				</div>
			))}
		</div>
	)
}

export function AssistantMessage({
	message,
	handleGoToRecipe,
	handleSaveRecipe,
	isStreaming,
	saveRecipeStatus
}: {
	message: MessageType
	isStreaming: boolean
	saveRecipeStatus: MutationStatus
	handleGoToRecipe: ({
		recipeId,
		recipeName
	}: {
		recipeId: string | null
		recipeName: string
	}) => void
	handleSaveRecipe: ({
		content,
		messageId
	}: {
		content: string
		messageId?: string | undefined
	}) => void
}) {
	const t = useTranslations()

	const goToRecipe = ({ recipeId }: { recipeId: string | null }) => {
		const recipe = transformContentToRecipe({
			content: message.content
		})
		const recipeName = recipe.name

		handleGoToRecipe({
			recipeId,
			recipeName
		})
	}

	return (
		<div className='prose mx-auto flex flex-col p-4'>
			<div className='mx-auto w-full'>
				<div className='flex w-full justify-start gap-2'>
					<div className='shrink-0'>
						<UserCircleIcon />
					</div>

					<div className='flex flex-col pb-4'>
						<p className='mb-0 mt-0'>{message.content}</p>
					</div>
				</div>
				<div className='grid w-full grid-flow-col place-items-end gap-2 self-center'>
					<CollapseableRecipes recipes={message.recipes} />
					<SingleRecipe recipes={message.recipes} />
					{/* {message?.recipeId ? (
						// Go to recipe
						<Button
							className='btn btn-outline'
							onClick={() =>
								goToRecipe({
									recipeId: message.recipeId
								})
							}
						>
							{t.chatWindow.toRecipe}
						</Button>
					) : !isStreaming ? (
						// Save
						<Button
							className='btn btn-outline'
							isLoading={saveRecipeStatus === 'pending'}
							onClick={() =>
								handleSaveRecipe({
									content: message.content || '',
									messageId: message.id
								})
							}
						>
							{t.chatWindow.save}
						</Button>
					) : null} */}
				</div>
			</div>
		</div>
	)
}

function SingleRecipe({ recipes }: { recipes: MessageType['recipes'] }) {
	const t = useTranslations()
	const [isOpen, setIsOpen] = useState(true)

	const recipe = recipes?.[0]
	if (!recipe || recipes.length !== 1) {
		return null
	}
	return (
		<div className='prose relative col-span-1 w-full' key={recipe.name}>
			<div onClick={() => setIsOpen(!isOpen)} className='btn w-full'>
				{recipe.name}
				<span className='ml-auto'>
					<ChevronDownIcon className={cn(isOpen && 'rotate-180')} />
				</span>
			</div>
			{isOpen && (
				<div>
					<p>{recipe.description}</p>
					<div className='grid grid-cols-2 gap-2'>
						<div>
							<h3>{t.recipes.prepTime}</h3>
							<p>{recipe.prepTime}</p>
						</div>
						<div>
							<h3>{t.recipes.cookTime}</h3>
							<p>{recipe.cookTime}</p>
						</div>
					</div>
					<ul>
						<h3>{t.recipes.ingredients}</h3>
						{recipe.ingredients?.map((i) => <li key={i}>{i}</li>)}
					</ul>
					<ol>
						<h3>{t.recipes.instructions}</h3>
						{recipe.instructions?.map((i) => <li key={i}>{i}</li>)}
					</ol>
				</div>
			)}
		</div>
	)
}

function CollapseableRecipes({ recipes }: { recipes: MessageType['recipes'] }) {
	if (!recipes || recipes.length === 0 || recipes.length === 1) {
		return null
	}
	return (
		<div className='mx-auto grid grid-cols-2 gap-2'>
			{recipes.map((r, i) => (
				<div className='col-span-1' key={r.name + i}>
					<Button className='btn btn-outline w-full'>{r.name}</Button>
				</div>
			))}
		</div>
	)
}

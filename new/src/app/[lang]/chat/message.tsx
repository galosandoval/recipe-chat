import type { MutationStatus } from '@tanstack/react-query'
import { UserCircleIcon } from '~/components/icons'
import { useFiltersByUser } from '~/components/recipe-filters'
import { useTranslations } from '~/hooks/use-translations'
import type { Message as MessageType } from '~/schemas/chats'
import { AssistantMessage } from './assistant-message'

export const Message = function InnerMessage({
	message,
	// filters,
	handleGoToRecipe,
	handleSaveRecipe,
	saveRecipeStatus
}: {
	message: MessageType
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
						<p className='card mb-0 mt-0 whitespace-pre-line bg-primary-content p-3'>
							{message?.content || ''}
						</p>
					</div>
					<div className='self-start rounded-full bg-base-200 p-2'>
						<UserCircleIcon />
					</div>
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

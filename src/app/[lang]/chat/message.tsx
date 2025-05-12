'use client'

import { useFiltersByUser } from '~/components/recipe-filters'
import { useTranslations } from '~/hooks/use-translations'
import { AssistantMessage } from './assistant-message'
import { UserAvatar } from '~/components/avatars'
import { memo } from 'react'
import type { Message as PrismaMessage } from '@prisma/client'

export const Message = memo(function Message({
	message
}: {
	message: PrismaMessage
}) {
	if (message.role === 'assistant') {
		return <AssistantMessage message={message} />
	}

	return <UserMessage message={message} />
})

function UserMessage({ message }: { message: PrismaMessage }) {
	return (
		<div className='flex flex-col items-center self-center p-4'>
			<div className='mx-auto w-full'>
				<div className='flex justify-end gap-2'>
					<div className='flex flex-col items-end'>
						<p className='whitespace-pre-line rounded-lg bg-primary p-3 text-primary-foreground'>
							{message?.content || ''}
						</p>
					</div>
					<UserAvatar />
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

'use client'

import { type Message as GetChatMessageOutput } from '@prisma/client'
import { useChat, useChatMessages } from '~/hooks/use-chat'
import {
	type Dispatch,
	type SetStateAction,
	memo,
	useEffect,
	useMemo,
	useState
} from 'react'
import { ScreenLoader } from '~/components/loaders/screen'
import { type QueryStatus } from '@tanstack/react-query'
import { FiltersByUser } from '~/components/recipe-filters'
import { ValueProps } from './value-props'
import { ChatsSection } from '~/components/chats'
import { ChatLoader } from '~/components/loaders/chat'
import chatStore from '~/lib/chat-store'
import { Message } from './message'
import { AssistantMessage } from './assistant-message'
import { useScrollRef } from '~/hooks/use-scroll-to-bottom'

export default function ChatWindow() {
	const [, setScrollMode] = useState<'bottom' | 'top'>('top')
	return <Content setScrollMode={setScrollMode} />
}

const Content = memo(function Content(props: {
	setScrollMode: Dispatch<SetStateAction<'bottom' | 'top'>>
}) {
	const {
		chatId,
		handleChangeChat,
		status: chatsQueryStatus,
		onSubmitPrompt
	} = useChat()
	const messages = useChatMessages()
	const isStreaming = chatStore((state) => state.isStreaming)
	const isNewChat = messages.length === 0

	if (isNewChat) {
		return (
			<div className='flex flex-col gap-4'>
				<ValueProps onSubmit={onSubmitPrompt}>
					<ChatsSection
						chatId={chatId}
						handleChangeChat={handleChangeChat}
					/>

					<FiltersByUser />
				</ValueProps>
			</div>
		)
	}

	return (
		<div className='flex h-full flex-col gap-4'>
			<ChatWindowContent
				messagesStatus={
					'status' in props ? chatsQueryStatus : undefined
				}
				isStreaming={isStreaming}
			/>
		</div>
	)
})

function ChatWindowContent({
	messagesStatus,
	isStreaming
}: {
	messagesStatus?: QueryStatus
	isStreaming: boolean
}) {
	const messages = useChatMessages()
	const mutationVariables = chatStore((state) => state.mutationVariables)
	const sortedMessages = messages.sort((a, b) => {
		const aSortOrder = a?.sortOrder ?? 0
		const bSortOrder = b?.sortOrder ?? 0
		return aSortOrder - bSortOrder
	})

	useEffect(() => {
		console.log('sortedMessages', sortedMessages)
	}, [sortedMessages])

	if (isStreaming || sortedMessages) {
		return (
			<div className='h-full pb-16'>
				<Messages
					status={messagesStatus}
					isStreaming={isStreaming}
					data={
						mutationVariables
							? (mutationVariables.messages as GetChatMessageOutput[])
							: messages
					}
					// filters={filters}
				/>
			</div>
		)
	}

	return <ScreenLoader />
}

const Messages = memo(function Messages({
	status,
	isStreaming,
	data
}: {
	status?: QueryStatus
	isStreaming: boolean
	data?: GetChatMessageOutput[]
}) {
	const { stream } = chatStore((state) => state)

	useEffect(() => {
		console.log('stream', stream)
		console.log('data', data)
	}, [stream, data])

	if (!data) {
		return <p>No data</p>
	}

	const lastMessage = data?.at(-1)

	if (status === 'error') {
		return <p>Error</p>
	}

	return (
		<>
			<div>
				{data?.map((m, i) => (
					<Message message={m} key={m?.id || '' + i} />
				))}
				{/* While streaming, show the assistant message, after streaming is done, messages gets updated */}
				{stream.content && (
					<AssistantMessage streamedMessage={stream} />
				)}
				{isStreaming &&
					lastMessage?.role === 'user' &&
					!stream.content && <ChatLoader />}
			</div>
			<BottomRef />
		</>
	)
})

function BottomRef() {
	const bottomRef = useScrollRef()
	return <div ref={bottomRef} />
}

'use client'

import { type Chat, type Message as PrismaMessage } from '@prisma/client'
import { useChat } from '~/hooks/use-chat'
import { type Dispatch, type SetStateAction, memo, useState } from 'react'
import { ScreenLoader } from '~/components/loaders/screen'
import { type MutationStatus, type QueryStatus } from '@tanstack/react-query'
import { FiltersByUser } from '~/components/recipe-filters'
import { ValueProps } from './value-props'
import { ChatsSection, ChatsSideBarButton } from '~/components/chats'
import { ChatLoader } from '~/components/loaders/chat'
import { useSession } from 'next-auth/react'
import useChatStore from '~/hooks/use-chat-store'
import { createId } from '@paralleldrive/cuid2'
import { Message } from './message'
import { AssistantMessage } from './assistant-message'
import { useScrollRef } from '~/hooks/use-scroll-to-bottom'
import { useChatForm } from './use-chat-form'
import { H2 } from '~/components/ui/typography'
import { MessagesSquare, Plus } from 'lucide-react'

export default function ChatWindow() {
	const [, setScrollMode] = useState<'bottom' | 'top'>('top')
	return <Content setScrollMode={setScrollMode} />
}

const Content = memo(function Content(props: {
	setScrollMode: Dispatch<SetStateAction<'bottom' | 'top'>>
}) {
	const {
		chatId,
		isChatsModalOpen,
		isAuthenticated,
		handleToggleChatsModal,
		handleChangeChat,
		status: chatsQueryStatus,
		handleGetChatsOnSuccess
	} = useChat()
	const messages = useChatStore((state) => state.messages)
	const { onSubmit } = useChatForm()
	const { isStreaming } = useChatStore()
	const isNewChat = messages.length === 0

	if (isNewChat) {
		return (
			<div className='flex flex-col gap-4'>
				<ValueProps onSubmit={onSubmit}>
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
				saveRecipeStatus={'idle'}
				chatId={chatId}
				messagesStatus={
					'status' in props ? chatsQueryStatus : undefined
				}
				isChatsModalOpen={isChatsModalOpen}
				isStreaming={isStreaming}
				isAuthenticated={isAuthenticated}
				handleGetChatsOnSuccess={
					'handleGetChatsOnSuccess' in props
						? handleGetChatsOnSuccess
						: undefined
				}
				handleChangeChat={
					'handleChangeChat' in props ? handleChangeChat : undefined
				}
				handleToggleChatsModal={handleToggleChatsModal}
			/>
		</div>
	)
})

function ChatWindowContent({
	messagesStatus,
	isAuthenticated,
	handleGetChatsOnSuccess,
	handleChangeChat,
	handleToggleChatsModal,
	isChatsModalOpen,
	saveRecipeStatus,
	isStreaming,
	chatId
}: {
	messagesStatus?: QueryStatus
	isAuthenticated: boolean
	handleGetChatsOnSuccess?: (
		data: (Chat & {
			messages: PrismaMessage[]
		})[]
	) => void
	handleChangeChat?: (
		chat: Chat & {
			messages: PrismaMessage[]
		}
	) => void
	handleToggleChatsModal: () => void
	isChatsModalOpen: boolean
	isStreaming: boolean
	chatId?: string
	saveRecipeStatus: MutationStatus
}) {
	const { data } = useSession()
	const messages = useChatStore((state) => state.messages)

	if (messages.length || isStreaming || !data?.user?.id) {
		return (
			<div className='h-full pb-16 pt-12'>
				<Messages
					saveRecipeStatus={saveRecipeStatus}
					chatId={chatId}
					status={messagesStatus}
					isChatsModalOpen={isChatsModalOpen}
					isStreaming={isStreaming}
					isAuthenticated={isAuthenticated}
					// filters={filters}
					handleGetChatsOnSuccess={handleGetChatsOnSuccess}
					handleChangeChat={handleChangeChat}
					handleToggleChatsModal={handleToggleChatsModal}
				/>
			</div>
		)
	}

	return <ScreenLoader />
}

const Messages = memo(function Messages({
	status,
	chatId,
	isChatsModalOpen,
	isAuthenticated,
	isStreaming,
	handleGetChatsOnSuccess,
	handleChangeChat,
	handleToggleChatsModal
}: {
	status?: QueryStatus
	chatId?: string
	isChatsModalOpen: boolean
	isStreaming: boolean
	isAuthenticated: boolean
	saveRecipeStatus: MutationStatus
	handleChangeChat?: (
		chat: Chat & {
			messages: PrismaMessage[]
		}
	) => void
	handleToggleChatsModal: () => void
	handleGetChatsOnSuccess?: (
		data: (Chat & {
			messages: PrismaMessage[]
		})[]
	) => void
}) {
	const { stream, messages } = useChatStore((state) => state)
	const startNewChat = useChatStore((state) => state.startNewChat)

	if (status === 'error') {
		return <p>Error</p>
	}

	const lastMessage = messages.at(-1)

	return (
		<>
			<div className='py-2'>
				<div className='mx-auto grid grid-cols-3 px-2'>
					{handleChangeChat &&
					handleGetChatsOnSuccess &&
					isAuthenticated ? (
						<ChatsSideBarButton
							chatId={chatId}
							isChatsModalOpen={isChatsModalOpen}
							handleChangeChat={handleChangeChat}
							handleToggleChatsModal={handleToggleChatsModal}
							onSuccess={handleGetChatsOnSuccess}
						/>
					) : (
						<div></div>
					)}

					<div className='flex items-center justify-center gap-2'>
						<MessagesSquare size={24} />
						<H2 className='mb-0 border-b-0 pb-0'>Chat</H2>
					</div>

					<button
						onClick={startNewChat}
						className='btn btn-circle btn-ghost justify-self-end'
					>
						<Plus />
					</button>
				</div>
			</div>

			<div className='pb-16'>
				{messages.map((m, i) => (
					<Message message={m} key={m?.id || '' + i} />
				))}
				{/* While streaming, show the assistant message, after streaming is done, messages gets updated */}
				{stream.message && (
					<AssistantMessage
						message={{
							content: stream.message,
							role: 'assistant',
							id: createId().slice(0, 10),
							recipes: stream.recipes
						}}
					/>
				)}
				{isStreaming &&
					lastMessage?.role === 'user' &&
					!stream.message && <ChatLoader />}
			</div>
			<BottomRef />
		</>
	)
})

function BottomRef() {
	const bottomRef = useScrollRef()
	return <div ref={bottomRef} />
}

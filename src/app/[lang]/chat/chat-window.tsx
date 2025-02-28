'use client'

import { type Chat, type Message as PrismaMessage } from '@prisma/client'
import { useChat } from '~/hooks/use-chat'
import { type Dispatch, type SetStateAction, memo, useState } from 'react'
import { ScreenLoader } from '~/components/loaders/screen'
import { type MutationStatus, type QueryStatus } from '@tanstack/react-query'
import { FiltersByUser } from '~/components/recipe-filters'
import { ValueProps } from './value-props'
import { ChatsSection, ChatsSideBarButton } from '~/components/chats'
import { ChatBubbleLeftIcon, PlusIcon } from '~/components/icons'
import { ChatLoader } from '~/components/loaders/chat'
import { useSession } from 'next-auth/react'
import useChatStore from '~/hooks/use-chat-store'
import { createId } from '@paralleldrive/cuid2'
import { Message } from './message'
import { AssistantMessage } from './assistant-message'
import { useScrollRef } from '~/hooks/use-scroll-to-bottom'
import { useChatForm } from './use-chat-form'

// type MessageContentProps = Omit<
// 	ChatType,
// 	'input' | 'handleSubmit' | 'handleInputChange'
// >

export default function ChatWindow() {
	const [, setScrollMode] = useState<'bottom' | 'top'>('top')

	return <Content setScrollMode={setScrollMode} />
}

const Content = memo(function Content(props: {
	setScrollMode: Dispatch<SetStateAction<'bottom' | 'top'>>
}) {
	const {
		chatId,
		// filters,
		// messages,
		isChatsModalOpen,
		// isStreaming,
		isAuthenticated,
		handleToggleChatsModal,
		handleSaveRecipe,
		handleChangeChat,
		// createRecipeStatus,
		// handleCloseSignUpModal,
		// handleSubmitCreds,
		// isSigningUp,
		// isSignUpModalOpen,
		// onSubmitCreds,
		// registerCreds,
		// signUpErrors,
		// fetchStatus: chatsFetchStatus,
		status: chatsQueryStatus,
		handleGetChatsOnSuccess
	} = useChat()
	const messages = useChatStore((state) => state.messages)
	const { onSubmit } = useChatForm()
	// const { setScrollMode } = props
	// const { data } = filters
	// const scrollToBottom = useScrollToBottom()
	// const scrollToTop = useScrollToTop()
	// const [sticky] = useSticky()

	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	// const currentChatId = JSON.parse('null')

	// const isSessionStorageAvailable =
	// 	typeof window !== 'undefined' && typeof currentChatId === 'string'

	const { isStreaming } = useChatStore()
	// const isNewChat =
	// 	(currentChatId === '' || currentChatId === null) && !isStreaming
	const isNewChat = messages.length === 0
	//  && messages.length === 0

	// const isMessagesSuccess =
	// 	chatsFetchStatus === 'idle' && chatsQueryStatus === 'success'

	// const shouldBeLoading =
	// 	isSessionStorageAvailable &&
	// 	// (messages.length === 0 || !isMessagesSuccess) &&
	// 	chatsFetchStatus === 'fetching'

	// don't scroll to bottom when showing value props
	// useEffect(() => {
	// 	if (isNewChat) {
	// 		setScrollMode('top')
	// 	} else {
	// 		setScrollMode('bottom')
	// 	}
	// }, [isNewChat])

	// useEffect(() => {
	// 	if (isMessagesSuccess) {
	// 		// scrollToBottom({ behavior: 'auto' })
	// 	}
	// }, [chatsFetchStatus, chatsQueryStatus])

	if (isNewChat) {
		return (
			<div className='flex flex-col gap-4'>
				{/*  eslint-disable-next-line @typescript-eslint/no-unsafe-call */}
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
	// if (shouldBeLoading && !isStreaming) {
	// 	return <ScreenLoader />
	// }

	return (
		<>
			<div className='flex h-full flex-col gap-4'>
				<ChatWindowContent
					saveRecipeStatus={'idle'}
					handleSaveRecipe={handleSaveRecipe}
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
						'handleChangeChat' in props
							? handleChangeChat
							: undefined
					}
					handleToggleChatsModal={handleToggleChatsModal}
					// filters={data ?? []}
				/>
			</div>

			{/* <div
				className={`absolute bottom-20 right-4 duration-300 transition-all${
					!sticky
						? 'translate-y-0 opacity-100'
						: 'invisible translate-y-4 opacity-0'
				}`}
			>
				<button
					className='btn btn-circle glass'
					onClick={() => scrollToBottom({ behavior: 'smooth' })}
				>
					<ArrowSmallDownIcon />
				</button>
			</div>
			<div
				className={`absolute bottom-20 left-4 duration-300 transition-all${
					sticky && !isStreaming
						? 'translate-y-0 opacity-100'
						: 'invisible translate-y-4 opacity-0'
				}`}
			>
				<button
					className='btn btn-circle glass'
					onClick={() => scrollToTop({ behavior: 'smooth' })}
				>
					<ArrowSmallUpIcon />
				</button>
			</div> */}

			{/* <SignUpModal
				closeModal={handleCloseSignUpModal}
				errors={signUpErrors}
				handleSubmit={handleSubmitCreds}
				isLoading={isSigningUp}
				isOpen={isSignUpModalOpen}
				onSubmit={onSubmitCreds}
				register={registerCreds}
			/> */}
		</>
	)
})

function ChatWindowContent({
	messagesStatus,
	isAuthenticated,
	handleGetChatsOnSuccess,
	handleChangeChat,
	handleToggleChatsModal,
	handleSaveRecipe,
	// filters,
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
	// filters: Filter[]
	isChatsModalOpen: boolean
	isStreaming: boolean
	chatId?: string
	saveRecipeStatus: MutationStatus
	handleSaveRecipe: ({
		content,
		messageId
	}: {
		content: string
		messageId?: string | undefined
	}) => void
}) {
	const { data } = useSession()
	const messages = useChatStore((state) => state.messages)

	if (messages.length || isStreaming || !data?.user?.id) {
		return (
			<div className='h-full py-16'>
				<Messages
					saveRecipeStatus={saveRecipeStatus}
					handleSaveRecipe={handleSaveRecipe}
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
	// saveRecipeStatus,
	// filters,
	handleGetChatsOnSuccess,
	handleChangeChat,
	handleToggleChatsModal
	// handleSaveRecipe
}: {
	status?: QueryStatus
	chatId?: string
	isChatsModalOpen: boolean
	isStreaming: boolean
	isAuthenticated: boolean
	saveRecipeStatus: MutationStatus
	// filters: Filter[]
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
	handleSaveRecipe: ({
		content,
		messageId
	}: {
		content: string
		messageId?: string | undefined
	}) => void
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
				<div className='prose mx-auto grid grid-cols-3 px-2'>
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
						<ChatBubbleLeftIcon size={6} />
						<h2 className='mb-2 mt-2 text-lg'>Chat</h2>
					</div>

					<button
						onClick={startNewChat}
						className='btn btn-circle btn-ghost justify-self-end'
					>
						<PlusIcon />
					</button>
				</div>
			</div>

			<div className='pb-16'>
				{messages.map((m, i) => (
					<Message
						message={m}
						key={m?.id || '' + i}
						// handleSaveRecipe={handleSaveRecipe}
						// saveRecipeStatus={saveRecipeStatus}
						// filters={filters}
					/>
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

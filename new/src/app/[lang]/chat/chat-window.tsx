'use client'

import { type Chat, type Message as PrismaMessage } from '@prisma/client'
import { useChat, type ChatType } from '~/hooks/use-chat'
import {
	type Dispatch,
	type SetStateAction,
	memo,
	useEffect,
	useState
} from 'react'
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
import { AssistantMessage, Message } from './message'

type MessageContentProps = Omit<
	ChatType,
	'input' | 'handleSubmit' | 'handleInputChange'
>

export default function ChatWindow() {
	const [scrollMode, setScrollMode] = useState<'bottom' | 'top'>('top')

	return (
		// NoSsr prevents ScrollToBottom from creating class name on server side
		// <ScrollToBottom
		// 	followButtonClassName='hidden'
		// 	initialScrollBehavior='auto'
		// 	className='h-full'
		// 	mode={scrollMode}
		// >
		<Content setScrollMode={setScrollMode} />
		// </ScrollToBottom>
	)
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
		handleGoToRecipe,
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
		fetchStatus: chatsFetchStatus,
		status: chatsQueryStatus,
		handleGetChatsOnSuccess
	} = useChat()
	const messages = useChatStore((state) => state.messages)
	const { setScrollMode } = props
	// const { data } = filters
	// const scrollToBottom = useScrollToBottom()
	// const scrollToTop = useScrollToTop()
	// const [sticky] = useSticky()

	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const currentChatId = JSON.parse('null')

	// const isSessionStorageAvailable =
	// 	typeof window !== 'undefined' && typeof currentChatId === 'string'

	const { isStreaming } = useChatStore()
	// const isNewChat =
	// 	(currentChatId === '' || currentChatId === null) && !isStreaming
	const isNewChat = messages.length === 0
	//  && messages.length === 0

	const isMessagesSuccess =
		chatsFetchStatus === 'idle' && chatsQueryStatus === 'success'

	// const shouldBeLoading =
	// 	isSessionStorageAvailable &&
	// 	// (messages.length === 0 || !isMessagesSuccess) &&
	// 	chatsFetchStatus === 'fetching'

	// don't scroll to bottom when showing value props
	useEffect(() => {
		if (isNewChat) {
			setScrollMode('top')
		} else {
			setScrollMode('bottom')
		}
	}, [isNewChat])

	useEffect(() => {
		if (isMessagesSuccess) {
			// scrollToBottom({ behavior: 'auto' })
		}
	}, [chatsFetchStatus, chatsQueryStatus])

	if (isNewChat) {
		return (
			<div className='flex flex-col gap-4'>
				{/*  eslint-disable-next-line @typescript-eslint/no-unsafe-call */}
				<ValueProps>
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
					handleGoToRecipe={handleGoToRecipe}
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
	handleGoToRecipe,
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
	const { data } = useSession()
	const messages = useChatStore((state) => state.messages)

	if (messages.length || isStreaming || !data?.user?.id) {
		return (
			<div className='h-full py-16'>
				<Messages
					saveRecipeStatus={saveRecipeStatus}
					handleGoToRecipe={handleGoToRecipe}
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
	saveRecipeStatus,
	// filters,
	handleGetChatsOnSuccess,
	handleChangeChat,
	handleToggleChatsModal,
	handleGoToRecipe,
	handleSaveRecipe
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
	const { stream: reply, messages } = useChatStore((state) => state)

	if (status === 'error') {
		return <p>Error</p>
	}

	const startNewChat = useChatStore((state) => state.startNewChat)
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
						isStreaming={isStreaming}
						handleGoToRecipe={handleGoToRecipe}
						handleSaveRecipe={handleSaveRecipe}
						saveRecipeStatus={saveRecipeStatus}
						// filters={filters}
					/>
				))}
				{/* While streaming, show the assistant message, after streaming is done, messages gets updated */}
				{reply.message && (
					<AssistantMessage
						handleGoToRecipe={handleGoToRecipe}
						handleSaveRecipe={handleSaveRecipe}
						isStreaming={isStreaming}
						saveRecipeStatus={saveRecipeStatus}
						message={{
							content: reply.message,
							role: 'assistant',
							id: createId().slice(0, 10),
							recipes: reply.recipes
						}}
					/>
				)}
				{isStreaming &&
					lastMessage?.role === 'user' &&
					!reply.message && <ChatLoader />}
			</div>
		</>
	)
})

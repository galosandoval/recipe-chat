'use client'

import { type Chat, type Message as PrismaMessage } from '@prisma/client'
import {
	transformContentToRecipe,
	useChat,
	type ChatType
} from '~/hooks/use-chat'
import {
	type Dispatch,
	type SetStateAction,
	memo,
	useEffect,
	useRef,
	useState
} from 'react'
import { ScreenLoader } from '~/components/loaders/screen'
import { type MutationStatus, type QueryStatus } from '@tanstack/react-query'
import { FiltersByUser, useFiltersByUser } from '~/components/recipe-filters'
import { ValueProps } from './value-props'
import { ChatsSection, ChatsSideBarButton } from '~/components/chats'
import {
	ChatBubbleLeftIcon,
	ChevronDownIcon,
	PlusIcon,
	UserCircleIcon
} from '~/components/icons'
import { ChatLoader } from '~/components/loaders/chat'
import { Button } from '~/components/button'
import { useSession } from 'next-auth/react'
import { useTranslations } from '~/hooks/use-translations'
import { SignUpModal } from '~/components/auth-modals'
import useChatStore from '~/hooks/use-chat-store'
import { useChatForm } from './use-chat-form'
import { createId } from '@paralleldrive/cuid2'
import type { GeneratedRecipes, Message } from '~/schemas/chats'

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
			<div className='h-full bg-primary-content py-16'>
				<MessageList
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

const MessageList = memo(function MessageList({
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
			<div className='bg-base-100 py-2'>
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
						<h2 className='mb-2 mt-2'>Chat</h2>
						<ChatBubbleLeftIcon />
					</div>

					<button
						onClick={startNewChat}
						className='btn btn-circle btn-ghost justify-self-end'
					>
						<PlusIcon />
					</button>
				</div>
			</div>

			<div className='bg-primary-content pb-16'>
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

const Message = function Message({
	message,
	isStreaming,
	// filters,
	handleGoToRecipe,
	handleSaveRecipe,
	saveRecipeStatus
}: {
	message: Message
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

function UserMessage({ message }: { message: Message }) {
	return (
		<div className='flex flex-col items-center self-center bg-base-200 p-4'>
			<div className='prose mx-auto w-full'>
				<div className='flex justify-end gap-2'>
					<div className='flex flex-col items-end'>
						<p className='mb-0 mt-0 whitespace-pre-line'>
							{message?.content || ''}
						</p>
					</div>
					<div>
						<UserCircleIcon />
					</div>
				</div>
				<ActiveFilters />
			</div>
		</div>
	)
}

function AssistantMessage({
	message,
	handleGoToRecipe,
	handleSaveRecipe,
	isStreaming,
	saveRecipeStatus
}: {
	message: Message
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
		<div className='flex flex-col p-4'>
			<div className='prose mx-auto w-full'>
				<div className='flex w-full justify-start gap-2 self-center'>
					<div>
						<UserCircleIcon />
					</div>

					<div className='prose flex flex-col pb-4'>
						<p className='mb-0 mt-0 whitespace-pre-line'>
							{message.content}
						</p>
					</div>
				</div>
				<div className='prose grid w-full grid-flow-col place-items-end gap-2 self-center'>
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

function SingleRecipe({ recipes }: { recipes: Message['recipes'] }) {
	const t = useTranslations()

	const recipe = recipes?.[0]
	if (!recipe || recipes.length !== 1) {
		return null
	}
	return (
		<div className='prose collapse relative col-span-1' key={recipe.name}>
			<input type='checkbox' className='peer' />
			<h3 className='collapse-title mt-0'>{recipe.name}</h3>
			<div className='absolute right-4 top-5 peer-checked:rotate-180'>
				<ChevronDownIcon />
			</div>
			<div className='collapse-content'>
				<p className=''>{recipe.description}</p>
				<div className='grid grid-cols-2 gap-2'>
					<div className=''>
						<h3 className=''>{t.recipes.prepTime}</h3>
						<p className=''>{recipe.prepTime}</p>
					</div>
					<div className=''>
						<h3 className=''>{t.recipes.cookTime}</h3>
						<p className=''>{recipe.cookTime}</p>
					</div>
				</div>
				<ul className=''>
					<h3 className=''>{t.recipes.ingredients}</h3>
					{recipe.ingredients?.map((i) => <li key={i}>{i}</li>)}
				</ul>
				<ol className=''>
					<h3 className=''>{t.recipes.instructions}</h3>
					{recipe.instructions?.map((i) => <li key={i}>{i}</li>)}
				</ol>
			</div>
		</div>
	)
}
function CollapseableRecipes({ recipes }: { recipes: Message['recipes'] }) {
	if (!recipes || recipes.length === 0 || recipes.length === 1) {
		return null
	}
	return (
		<div className='grid grid-cols-2 gap-2'>
			{recipes.map((r, i) => (
				<div className='col-span-1' key={r.name + i}>
					<Button className='btn btn-outline w-full'>{r.name}</Button>
				</div>
			))}
		</div>
	)
}

function removeBracketsAndQuotes(str: string) {
	// removes {} and [] and "" and , from string
	return str.replace(/[{}[\]""]/g, '').replace(/,/g, ' ')
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

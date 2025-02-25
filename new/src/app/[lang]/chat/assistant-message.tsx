import type { Message as MessageType } from '~/schemas/chats'
import { useTranslations } from '~/hooks/use-translations'
import { useChatForm } from './use-chat-form'
import { useScrollRef } from '~/hooks/use-scroll-to-bottom'
import { Button } from '~/components/button'
import {
	BookmarkIcon,
	ChevronDownIcon,
	ClockIcon,
	LogoIcon,
	PlaneIcon
} from '~/components/icons'
import { transformContentToRecipe } from '~/hooks/use-chat'
import type { MutationStatus } from '@tanstack/react-query'
import { useState } from 'react'
import { cn } from '~/utils/cn'

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
						<div className='rounded-full bg-base-200 p-2'>
							<LogoIcon />
						</div>
					</div>

					<div className='card flex flex-col bg-base-200 p-3'>
						<p className='mb-0 mt-0'>{message.content}</p>
						<div className='grid w-full grid-flow-col place-items-end gap-2 self-center'>
							<SingleRecipe recipes={message.recipes} />
							<CollapseableRecipes recipes={message.recipes} />
						</div>
					</div>
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
		<div
			className='prose card relative col-span-1 mt-2 w-full bg-base-100 p-3'
			key={recipe.name}
		>
			{/* <div onClick={() => setIsOpen(!isOpen)} className='btn w-full'>
				{recipe.name}
				<span className='ml-auto'>
					<ChevronDownIcon className={cn(isOpen && 'rotate-180')} />
				</span>
			</div> */}
			<div>
				<h3 className='card-title mb-0 text-lg'>{recipe.name}</h3>
				<p className='mb-2 text-sm'>{recipe.description}</p>
				{isOpen && (
					<>
						<Times
							prepTime={recipe.prepTime}
							cookTime={recipe.cookTime}
						/>
						<Ingredients ingredients={recipe.ingredients} />
						<Instructions instructions={recipe.instructions} />
					</>
				)}
			</div>
			<div className='card-actions flex justify-between'>
				<Button
					className='btn btn-outline'
					onClick={() => setIsOpen(!isOpen)}
				>
					<ChevronDownIcon
						className={cn('h-5 w-5', isOpen && 'rotate-180')}
					/>
					{isOpen ? t.chatWindow.collapse : t.chatWindow.expand}
				</Button>
				<Button className='btn btn-outline'>
					<BookmarkIcon className='h-5 w-5' />
					{t.chatWindow.save}
				</Button>
			</div>
		</div>
	)
}

function Times({
	prepTime,
	cookTime
}: {
	prepTime?: string
	cookTime?: string
}) {
	const t = useTranslations()
	return (
		<div className='mb-2 flex items-center gap-2'>
			<ClockIcon className='size-4' />
			<div className='flex items-center gap-2'>
				<h3 className='mb-0 text-sm'>{t.recipes.prepTime}</h3>
				<p className='mb-0 text-sm'>{prepTime}</p>
			</div>
			<div className='flex items-center gap-2'>
				<h3 className='mb-0 text-sm'>{t.recipes.cookTime}</h3>
				<p className='mb-0 text-sm'>{cookTime}</p>
			</div>
		</div>
	)
}

function Ingredients({ ingredients }: { ingredients?: string[] }) {
	const t = useTranslations()
	return (
		<>
			{ingredients && (
				<h3 className='mb-0 text-base'>{t.recipes.ingredients}</h3>
			)}
			<ul className='mb-2 pl-6'>
				{ingredients?.map((i, index) => (
					<li className='my-0' key={i + index}>
						{i}
					</li>
				))}
			</ul>
		</>
	)
}

function Instructions({ instructions }: { instructions?: string[] }) {
	const t = useTranslations()
	return (
		<>
			{instructions && (
				<h3 className='mb-0 text-base'>{t.recipes.instructions}</h3>
			)}
			<ol className='mb-2 pl-6'>
				{instructions?.map((i, index) => (
					<li className='my-0' key={i + index}>
						{i}
					</li>
				))}
			</ol>
		</>
	)
}

function CollapseableRecipes({ recipes }: { recipes: MessageType['recipes'] }) {
	const t = useTranslations()
	const [generated, setGenerated] = useState<boolean[]>(
		recipes?.map(() => false) || []
	)
	const { onSubmit: onChatFormSubmit, isStreaming } = useChatForm()

	if (!recipes || recipes.length === 0 || recipes.length === 1) {
		return null
	}

	const generateRecipe = async (
		name: string,
		description: string,
		index: number
	) => {
		await onChatFormSubmit({
			prompt: `Generate a recipe for ${name}: ${description}`
		})
		setGenerated((state) => {
			const newState = [...state]
			newState[index] = true
			return newState
		})
	}

	return (
		<div className='mx-auto grid grid-cols-1 gap-2 pt-2'>
			{recipes.map((r, i) => (
				<div
					className='card border border-base-300 bg-base-100 p-3'
					key={r.name + i}
				>
					<h3 className='card-title'>{r.name}</h3>
					<p>{r.description}</p>

					<div className='card-actions flex'>
						{generated[i] ? (
							<Button className='btn btn-primary w-full'>
								<BookmarkIcon />
								{t.chatWindow.save}
							</Button>
						) : (
							<GenerateButton
								disabled={isStreaming}
								onClick={() =>
									generateRecipe(r.name, r.description, i)
								}
							/>
						)}
					</div>
				</div>
			))}
		</div>
	)
}

function GenerateButton({
	disabled,
	onClick
}: {
	disabled: boolean
	onClick: () => Promise<void>
}) {
	const t = useTranslations()
	const bottomRef = useScrollRef()

	const scrollToBottom = () => {
		bottomRef?.current?.scrollIntoView({ behavior: 'smooth' })
	}

	const handleGenerate = async () => {
		scrollToBottom()
		await onClick()
	}

	return (
		<Button
			className='btn btn-outline w-full'
			disabled={disabled}
			onClick={handleGenerate}
		>
			<PlaneIcon />
			{t.chatWindow.generate}
		</Button>
	)
}

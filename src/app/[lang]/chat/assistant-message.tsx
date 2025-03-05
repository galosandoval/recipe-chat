'use client'

import type { Message as MessageType } from '~/schemas/chats'
import { useTranslations } from '~/hooks/use-translations'
import { useChatForm } from './use-chat-form'
import { LogoIcon } from '~/components/icons'
import { useState } from 'react'
import { cn } from '~/lib/utils'
import { useSession } from 'next-auth/react'
import { SignUpModalTrigger } from '~/components/auth-triggers'
import { Button } from '~/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from '~/components/ui/card'
import { H4, P } from '~/components/ui/typography'
import { ChevronDown, Clock, Save, Send } from 'lucide-react'
import { SaveButton } from '~/components/save-button'
export function AssistantMessage({ message }: { message: MessageType }) {
	return (
		<div className='mx-auto flex flex-col p-4'>
			<div className='mx-auto w-full'>
				<div className='flex w-full justify-start gap-2'>
					<div className='shrink-0'>
						<Avatar>
							<AvatarImage src='/images/favicon-16x16.png' />
							<AvatarFallback>
								<LogoIcon />
							</AvatarFallback>
						</Avatar>
					</div>

					<div className='flex flex-col rounded-lg bg-secondary p-3 text-secondary-foreground'>
						<P>{message.content}</P>
						<div className='w-full'>
							<CollapseableRecipe recipes={message.recipes} />
							<RecipesToGenerate recipes={message.recipes} />
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

function CollapseableRecipe({ recipes }: { recipes: MessageType['recipes'] }) {
	const t = useTranslations()
	const [isOpen, setIsOpen] = useState(true)
	const { status } = useSession()
	const isAuthenticated = status === 'authenticated'

	const recipe = recipes?.[0]
	if (!recipe || recipes.length !== 1) {
		return null
	}

	const handleSaveRecipe = () => {
		// Add save recipe logic here when user is authenticated
		console.log('Save recipe:', recipe)
	}

	return (
		<Card key={recipe.name} className='mt-2 bg-background'>
			<CardHeader>
				<CardTitle>{recipe.name}</CardTitle>
				<CardDescription>{recipe.description}</CardDescription>
				{isOpen && (
					<CardContent className='p-0'>
						<Times
							prepTime={recipe.prepTime}
							cookTime={recipe.cookTime}
						/>
						<Ingredients ingredients={recipe.ingredients} />
						<Instructions instructions={recipe.instructions} />
					</CardContent>
				)}
			</CardHeader>
			<CardFooter className='card-actions flex justify-between'>
				<Button variant='secondary' onClick={() => setIsOpen(!isOpen)}>
					<ChevronDown
						className={cn('h-5 w-5', isOpen && 'rotate-180')}
					/>
					{isOpen ? t.chatWindow.collapse : t.chatWindow.expand}
				</Button>

				{isAuthenticated ? (
					<SaveButton handleSaveRecipe={handleSaveRecipe}>
						{t.chatWindow.save}
					</SaveButton>
				) : (
					<SignUpModalTrigger>
						<Save className='h-5 w-5' />
						{t.chatWindow.save}
					</SignUpModalTrigger>
				)}
			</CardFooter>
		</Card>
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
		<div className='mb-2 flex items-center gap-2 self-center text-sm text-muted-foreground'>
			<Clock className='size-4' />
			{prepTime !== undefined && (
				<span className='flex items-center gap-2'>
					{t.recipes.prepTime} {prepTime}
				</span>
			)}
			{cookTime !== undefined && (
				<span className='flex items-center gap-2'>
					{t.recipes.cookTime} {cookTime}
				</span>
			)}
		</div>
	)
}

function Ingredients({ ingredients }: { ingredients?: string[] }) {
	const t = useTranslations()
	return (
		<>
			{ingredients && (
				<H4 className='text-base'>{t.recipes.ingredients}</H4>
			)}
			<ul className='mb-2 list-inside list-disc'>
				{ingredients?.map((i, index) => <li key={i + index}>{i}</li>)}
			</ul>
		</>
	)
}

function Instructions({ instructions }: { instructions?: string[] }) {
	const t = useTranslations()
	return (
		<>
			{instructions && (
				<H4 className='text-base'>{t.recipes.instructions}</H4>
			)}
			<ol className='list-inside list-decimal'>
				{instructions?.map((i, index) => <li key={i + index}>{i}</li>)}
			</ol>
		</>
	)
}

function RecipesToGenerate({ recipes }: { recipes: MessageType['recipes'] }) {
	const t = useTranslations()
	const [generated, setGenerated] = useState<boolean[]>(
		recipes?.map(() => false) ?? []
	)
	const { onSubmit: onChatFormSubmit, isStreaming } = useChatForm()
	const { status } = useSession()
	const isAuthenticated = status === 'authenticated'

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

	const handleSaveRecipe = (
		recipe: NonNullable<MessageType['recipes']>[number]
	) => {
		// Add save recipe logic here when user is authenticated
		console.log('Save recipe:', recipe)
	}

	return (
		<div className='grid grid-cols-1 items-stretch gap-2 pt-2 sm:grid-cols-2'>
			{recipes.map((r, i) => (
				<Card key={r.name + i} className='bg-background'>
					<CardHeader className='p-3'>
						<CardTitle>{r.name}</CardTitle>
						<CardDescription>{r.description}</CardDescription>
					</CardHeader>

					<div className='flex'>
						{generated[i] ? (
							isAuthenticated ? (
								<Button
									className='w-full'
									onClick={() => handleSaveRecipe(r)}
								>
									<Save />
									{t.chatWindow.save}
								</Button>
							) : (
								<SignUpModalTrigger>
									<Save />
									{t.chatWindow.save}
								</SignUpModalTrigger>
							)
						) : (
							<GenerateButton
								disabled={isStreaming}
								onClick={() =>
									generateRecipe(r.name, r.description, i)
								}
							/>
						)}
					</div>
				</Card>
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

	const handleGenerate = async () => {
		await onClick()
	}

	return (
		<Button className='w-full' disabled={disabled} onClick={handleGenerate}>
			<Send />
			{t.chatWindow.generate}
		</Button>
	)
}

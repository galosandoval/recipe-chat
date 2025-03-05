'use client'

import { useTranslations } from '~/hooks/use-translations'
import { useForm, type UseFormRegister } from 'react-hook-form'
import {
	useChatForm,
	type ChatFormValues,
	chatFormSchema
} from './use-chat-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { Octagon, Send } from 'lucide-react'

export function SubmitPromptForm() {
	const t = useTranslations()
	const {
		onSubmit: onChatFormSubmit,
		isStreaming,
		onStopStreaming
	} = useChatForm()
	const { register, handleSubmit, formState, reset } =
		useForm<ChatFormValues>({
			defaultValues: {
				prompt: ''
			},
			resolver: zodResolver(chatFormSchema)
		})
	const isSubmitDisabled = formState.isSubmitting || !formState.isDirty

	const onSubmit = async (data: ChatFormValues) => {
		reset()
		await onChatFormSubmit(data)
	}

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className='fixed bottom-0 left-0 flex w-full items-center md:rounded-md'
		>
			<div className='mx-auto flex w-full items-center bg-background/75 py-2 backdrop-blur-sm sm:mb-2 sm:rounded-xl'>
				<PromptInput
					register={register}
					placeholder={t.chatFormPlaceholder}
				/>
				<SubmitButtons
					isStreaming={isStreaming}
					onStopStreaming={onStopStreaming}
					isSubmitDisabled={isSubmitDisabled}
				/>
			</div>
		</form>
	)
}

function PromptInput({
	register,
	placeholder
}: {
	register: UseFormRegister<ChatFormValues>
	placeholder: string
}) {
	return (
		<div className='flex w-full px-2'>
			<Input {...register('prompt')} placeholder={placeholder} />
		</div>
	)
}

function SubmitButtons({
	isStreaming,
	onStopStreaming,
	isSubmitDisabled
}: {
	isStreaming: boolean
	onStopStreaming: () => void
	isSubmitDisabled: boolean
}) {
	return (
		<div className='pr-2'>
			{isStreaming ? (
				<Button onClick={onStopStreaming} variant='destructive'>
					<Octagon />
				</Button>
			) : (
				<Button type='submit' disabled={isSubmitDisabled}>
					<Send />
				</Button>
			)}
		</div>
	)
}

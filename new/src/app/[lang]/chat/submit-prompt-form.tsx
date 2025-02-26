'use client'

import { Button } from '../../../components/button'
import { useTranslations } from '~/hooks/use-translations'
import { useForm, type UseFormRegister } from 'react-hook-form'
import { PlaneIcon, StopIcon } from '~/components/icons'
import {
	useChatForm,
	type ChatFormValues,
	chatFormSchema
} from './use-chat-form'
import { zodResolver } from '@hookform/resolvers/zod'

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
			<div className='prose mx-auto flex w-full items-center bg-base-300/75 py-2 sm:mb-2 sm:rounded-lg'>
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
			<input
				{...register('prompt')}
				placeholder={placeholder}
				className='input input-bordered relative w-full resize-none bg-base-100/75 focus:bg-base-100'
			/>
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
				<Button onClick={onStopStreaming} className='btn btn-error'>
					<StopIcon />
				</Button>
			) : (
				<Button
					type='submit'
					disabled={isSubmitDisabled}
					className='btn btn-accent'
				>
					<PlaneIcon />
				</Button>
			)}
		</div>
	)
}

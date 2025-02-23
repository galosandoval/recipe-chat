'use client'

import { Button } from '../../../components/button'
import { useTranslations } from '~/hooks/use-translations'
import { useForm } from 'react-hook-form'
import { PlaneIcon, StopIcon } from '~/components/icons'
import { useChatForm, type ChatFormValues } from './use-chat-form'

export function SubmitPromptForm() {
	const t = useTranslations()
	const { onSubmit: onChatFormSubmit, isStreaming } = useChatForm()
	const { register, handleSubmit, watch, reset } = useForm<ChatFormValues>({
		defaultValues: {
			prompt: ''
		}
	})

	const prompt = watch('prompt')

	const onSubmit = async (data: ChatFormValues) => {
		reset()
		await onChatFormSubmit(data)
	}

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className={`fixed bottom-0 left-0 flex w-full items-center md:rounded-md`}
		>
			<div className='prose mx-auto flex w-full items-center bg-base-300/75 py-1 sm:mb-2 sm:rounded-lg'>
				<div className='flex w-full px-2'>
					<input
						{...register('prompt')}
						placeholder={t.chatFormPlaceholder}
						className='input input-bordered relative w-full resize-none bg-base-100/75 focus:bg-base-100'
					/>
				</div>

				<div className='pr-2'>
					<Button
						type='submit'
						// TODO:fix with react-hook-form
						disabled={prompt.length < 5 && !isStreaming}
						className={`btn ${isStreaming ? 'btn-error' : 'btn-accent'}`}
					>
						{isStreaming ? <StopIcon /> : <PlaneIcon />}
					</Button>
				</div>
			</div>
		</form>
	)
}

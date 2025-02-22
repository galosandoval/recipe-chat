'use client'

import { useEffect, useRef } from 'react'
import { Button } from './button'
import { useTranslations } from '~/hooks/use-translations'
import { generate } from '~/app/[lang]/actions'
import { useForm } from 'react-hook-form'
import { readStreamableValue } from 'ai/rsc'
import useChatStore from '~/hooks/use-chat-store'

type ChatFormValues = {
	prompt: string
}

export function SubmitPromptForm() {
	const t = useTranslations()
	const { register, handleSubmit, watch } = useForm<ChatFormValues>({
		defaultValues: {
			prompt: ''
		}
	})
	const { setPrompt, isSendingMessage, setIsSendingMessage } = useChatStore(
		(state) => state
	)
	console.log('isSendingMessage', isSendingMessage)
	// const inputRef = useRef<HTMLInputElement>(null)

	// useEffect(() => {
	// 	inputRef.current?.focus()
	// }, [])

	const onSubmit = async (data: ChatFormValues) => {
		console.log('datatatata', data)
		setIsSendingMessage(true)
		const { object } = await generate({
			filters: [],
			messages: [{ role: 'user', content: data.prompt }]
		})
		console.log('object', object)
		for await (const partialObject of readStreamableValue(object)) {
			console.log('partialObject', partialObject)
			if (partialObject) {
				console.log('partialObject', partialObject)
				setPrompt(partialObject)
			}
		}

		setIsSendingMessage(false)
	}

	const prompt = watch('prompt')

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className={`fixed bottom-0 left-0 flex w-full items-center md:rounded-md`}
		>
			<div className='prose mx-auto flex w-full items-center bg-base-300/75 py-1 sm:mb-2 sm:rounded-lg'>
				<div className='flex w-full px-2 py-1'>
					<input
						{...register('prompt')}
						placeholder={t.chatFormPlaceholder}
						className='input input-bordered relative w-full resize-none bg-base-100/75 pt-2 focus:bg-base-100'
					/>
				</div>

				<div className='pr-2'>
					<Button
						type='submit'
						disabled={prompt.length < 5 && !isSendingMessage}
						className={`btn ${isSendingMessage ? 'btn-error' : 'btn-accent'}`}
					>
						{isSendingMessage ? (
							// stop icon
							<svg
								xmlns='http://www.w3.org/2000/svg'
								fill='none'
								viewBox='0 0 24 24'
								strokeWidth={1.5}
								stroke='currentColor'
								className='h-6 w-6'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									d='M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z'
								/>
							</svg>
						) : (
							// plane icon
							<svg
								xmlns='http://www.w3.org/2000/svg'
								fill='none'
								viewBox='0 0 24 24'
								strokeWidth={1.5}
								stroke='currentColor'
								className='h-6 w-6'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									d='M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5'
								/>
							</svg>
						)}
					</Button>
				</div>
			</div>
		</form>
	)
}

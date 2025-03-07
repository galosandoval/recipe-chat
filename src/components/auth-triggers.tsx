'use client'

import { useState } from 'react'
import { LoginModal, SignUpModal } from './auth-modals'
import { useLoginForm, useSignUpForm } from './auth-hooks'
import { Button } from './ui/button'
import { Dialog, DialogTrigger } from './ui/dialog'

type ModalTriggerProps = {
	children: React.ReactNode
	onSuccess?: () => Promise<void>
}

export function SignUpModalTrigger({ children, onSuccess }: ModalTriggerProps) {
	const [isOpen, setIsOpen] = useState(false)

	const handleSuccess = async () => {
		setIsOpen(false)
		if (onSuccess) await onSuccess()
	}

	const { register, handleSubmit, errors, onSubmit, isLoading } =
		useSignUpForm(handleSuccess)

	const handleOpen = () => {
		setIsOpen(true)
	}

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant='secondary' onClick={handleOpen}>
					{children}
				</Button>
			</DialogTrigger>
			<SignUpModal
				errors={errors}
				handleSubmit={handleSubmit}
				isLoading={isLoading}
				onSubmit={onSubmit}
				register={register}
			/>
		</Dialog>
	)
}

export function LoginModalTrigger({ children, onSuccess }: ModalTriggerProps) {
	const [isOpen, setIsOpen] = useState(false)

	const handleSuccess = async () => {
		setIsOpen(false)
		if (onSuccess) await onSuccess()
	}

	const { register, handleSubmit, errors, onSubmit, isSubmitting } =
		useLoginForm(handleSuccess)

	const handleOpen = () => {
		setIsOpen(true)
	}

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button onClick={handleOpen}>{children}</Button>
			</DialogTrigger>
			<LoginModal
				errors={errors}
				handleSubmit={handleSubmit}
				isSubmitting={isSubmitting}
				onSubmit={onSubmit}
				register={register}
			/>
		</Dialog>
	)
}

'use client'

import {
	type FieldErrorsImpl,
	type UseFormHandleSubmit,
	type UseFormRegister
} from 'react-hook-form'
import {
	LoginForm,
	SignUpForm,
	type LoginSchemaType,
	type SignUpSchemaType
} from './auth-forms'
import { DialogContent } from './ui/dialog'

export function SignUpModal({
	onSubmit,
	isLoading,
	errors,
	register,
	handleSubmit
}: {
	onSubmit: (data: SignUpSchemaType) => void
	isLoading: boolean
	errors: Partial<FieldErrorsImpl<SignUpSchemaType>>
	register: UseFormRegister<SignUpSchemaType>
	handleSubmit: UseFormHandleSubmit<SignUpSchemaType>
}) {
	return (
		<DialogContent>
			<SignUpForm
				errors={errors}
				handleSubmit={handleSubmit}
				isLoading={isLoading}
				onSubmit={onSubmit}
				register={register}
			/>
		</DialogContent>
	)
}

export function LoginModal({
	onSubmit,
	isSubmitting,
	errors,
	register,
	handleSubmit
}: {
	onSubmit: (data: LoginSchemaType) => void
	isSubmitting: boolean
	errors: Partial<FieldErrorsImpl<LoginSchemaType>>
	register: UseFormRegister<LoginSchemaType>
	handleSubmit: UseFormHandleSubmit<LoginSchemaType>
}) {
	return (
		<DialogContent>
			<LoginForm
				errors={errors}
				handleSubmit={handleSubmit}
				isSubmitting={isSubmitting}
				onSubmit={onSubmit}
				register={register}
			/>
		</DialogContent>
	)
}

// Re-export from auth-forms
export { loginSchema, signUpSchema } from './auth-forms'
export type { LoginSchemaType, SignUpSchemaType } from './auth-forms'

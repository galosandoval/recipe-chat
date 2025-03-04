'use client'

import {
	type FieldErrorsImpl,
	type UseFormHandleSubmit,
	type UseFormRegister
} from 'react-hook-form'
import { z } from 'zod'
import { ErrorMessage } from '~/components/error-message-content'
import { useTranslations, type Translations } from '~/hooks/use-translations'
import { handleSignIn } from '~/app/[lang]/actions'
import {
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from './ui/dialog'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Button } from './ui/button'

export const signUpSchema = (t: Translations) =>
	z
		.object({
			email: z.string().email(t.auth.emailRequired),
			password: z
				.string()
				.min(6, t.auth.minChars6)
				.max(20, t.auth.maxChars20),
			confirm: z
				.string()
				.min(6, t.auth.minChars6)
				.max(20, t.auth.maxChars20)
		})
		.refine((data) => data.confirm === data.password, {
			message: t.auth.passwordsDontMatch,
			path: ['confirm']
		})

type SignUpSchemaType = z.infer<ReturnType<typeof signUpSchema>>

export function SignUpForm({
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
	const t = useTranslations()

	return (
		<div className='mx-auto flex h-full flex-col items-center justify-center py-5'>
			<DialogHeader>
				<DialogTitle>{t.auth.signUp}</DialogTitle>
			</DialogHeader>

			<form onSubmit={handleSubmit(onSubmit)}>
				<div>
					<Label htmlFor='email'>
						<span>
							{t.auth.email}
							<span className='text-destructive'>*</span>
						</span>
					</Label>

					<Input
						className={`input input-bordered ${
							errors.email ? 'input-error' : ''
						}`}
						id='email'
						{...register('email')}
					/>

					<ErrorMessage errors={errors} name='email' />
				</div>
				<div>
					<Label htmlFor='password' className='label pb-1 pt-0'>
						<span>
							{t.auth.password}
							<span className='text-destructive'>*</span>
						</span>
					</Label>

					<Input
						className={`input input-bordered ${
							errors.password ? 'input-error' : ''
						}`}
						id='password'
						type='password'
						{...register('password')}
					/>
					<ErrorMessage errors={errors} name='password' />
				</div>
				<div>
					<Label
						htmlFor='confirmPassword'
						className='label pb-1 pt-0'
					>
						<span>
							{t.auth.confirmPassword}
							<span className='text-destructive'>*</span>
						</span>
					</Label>

					<Input
						className={`input input-bordered ${
							errors.confirm ? 'input-error' : ''
						}`}
						id='confirmPassword'
						type='password'
						{...register('confirm')}
					/>

					<ErrorMessage errors={errors} name='confirm' />
				</div>

				<DialogFooter className='flex flex-col gap-2'>
					<Button
						className='w-full'
						type='submit'
						isLoading={isLoading}
					>
						{t.auth.signUp}
					</Button>
					<Button
						className='w-full'
						onClick={() => handleSignIn({ provider: 'google' })}
						isLoading={isLoading}
					>
						{t.auth.signUpGoogle}
					</Button>
				</DialogFooter>
			</form>
		</div>
	)
}

export const loginSchema = (t: Translations) =>
	z.object({
		email: z.string().email(t.auth.emailRequired),
		password: z.string().min(1, t.required)
	})
type LoginSchemaType = z.infer<ReturnType<typeof loginSchema>>

export function LoginForm({
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
	const t = useTranslations()

	return (
		<div className='mx-auto flex h-full flex-col items-center justify-center py-5'>
			<DialogHeader>
				<DialogTitle>{t.auth.login}</DialogTitle>
				<DialogDescription>
					{'t.auth.loginDescription'}
				</DialogDescription>
			</DialogHeader>
			<form onSubmit={handleSubmit(onSubmit)}>
				<div>
					<Label htmlFor='email'>
						<span>{t.auth.email}</span>
					</Label>

					<Input
						id='email'
						className={`input input-bordered ${
							errors.email ? 'input-error' : ''
						}`}
						{...register('email')}
					/>

					<ErrorMessage errors={errors} name='email' />
				</div>

				<div>
					<Label htmlFor='password'>
						<span>{t.auth.password}</span>
					</Label>

					<Input
						id='password'
						type='password'
						{...register('password')}
					/>

					<ErrorMessage errors={errors} name='password' />
				</div>
				<DialogFooter
				// className='mt-4 flex w-full max-w-[300px] flex-col items-center gap-2'
				>
					<Button isLoading={isSubmitting} type='submit'>
						{t.auth.login}
					</Button>
				</DialogFooter>
			</form>
		</div>
	)
}

// Export types for use in other components
export type { SignUpSchemaType, LoginSchemaType }

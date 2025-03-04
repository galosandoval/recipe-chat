'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { api } from '~/trpc/react'
import { handleSignIn } from '~/app/[lang]/actions'
import { useTranslations } from '~/hooks/use-translations'
import {
	type LoginSchemaType,
	type SignUpSchemaType,
	loginSchema,
	signUpSchema
} from './auth-forms'
import { errorToast } from './toast'

export function useSignUpForm(onSuccess?: () => Promise<void>) {
	const t = useTranslations()
	const {
		register,
		handleSubmit,
		formState: { errors },
		setError
	} = useForm<SignUpSchemaType>({
		resolver: zodResolver(signUpSchema(t))
	})

	const { mutate, isPending } = api.auth.signUp.useMutation({
		onSuccess: async ({}, { email, password }) => {
			const response = await handleSignIn({
				provider: 'credentials',
				params: { email, password, redirect: false }
			})

			if (onSuccess) {
				await onSuccess()
			} else if (response?.ok) {
				toast.success(t.auth.signUpSuccess)
				// router.push('/chat')
			}
		},
		onError: (error) => {
			if (error.message && error.shape?.code === -32009) {
				setError('email', {
					type: 'pattern',
					message: error.message
				})
			} else if (error?.message?.includes('password')) {
				setError('password', {
					type: 'pattern',
					message: error.message
				})
			} else {
				console.log(error.message)
				toast.error(error.message)
			}
		}
	})

	const onSubmit = (values: SignUpSchemaType) => {
		mutate(values)
	}

	return {
		register,
		handleSubmit,
		errors,
		onSubmit,
		isLoading: isPending
	}
}

export function useLoginForm(onSuccess?: () => Promise<void>) {
	const t = useTranslations()
	const router = useRouter()
	const searchParams = useSearchParams()

	const {
		register,
		handleSubmit,
		setError,
		formState: { errors, isSubmitting }
	} = useForm<LoginSchemaType>({
		resolver: zodResolver(loginSchema(t))
	})

	const onSubmit = async (data: LoginSchemaType) => {
		const callback = searchParams.get('callbackUrl')
			? decodeURIComponent(searchParams.get('callbackUrl')!)
			: '/chat'

		try {
			const response = await handleSignIn({
				provider: 'credentials',
				params: { ...data, redirect: false }
			})

			if (onSuccess) {
				await onSuccess()
			} else if (response?.ok) {
				router.push(callback)
			}
		} catch (error) {
			console.error(error)
			errorToast(t.auth.invalidCreds)
			setError('email', { message: t.auth.invalidCreds })
			setError('password', { message: t.auth.invalidCreds })
		}
	}

	return {
		register,
		handleSubmit,
		errors,
		onSubmit,
		isSubmitting
	}
}

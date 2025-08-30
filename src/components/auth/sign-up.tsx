import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useTranslations } from '~/hooks/use-translations'
import { api } from '~/trpc/react'
import { toast } from '../toast'
import { signUpSchema, type SignUpSchemaType } from '~/schemas/sign-up-schema'

export function useSignUp(successCallback?: () => Promise<void>) {
  const t = useTranslations()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm<SignUpSchemaType>({
    resolver: zodResolver(signUpSchema)
  })
  const router = useRouter()

  const { mutate, isPending } = api.users.signUp.useMutation({
    onSuccess: async ({}, { email, password }) => {
      const response = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (successCallback) {
        await successCallback()
      } else if (response?.ok) {
        router.push('/chat')

        toast.success(t.auth.signUpSuccess)
      }
    },
    onError: (error) => {
      if (error.message && error.shape?.code === -32009) {
        setError('email', {
          type: 'pattern',
          message: t.auth.replace(error.message)
        })
      } else if (error.message && error.message.includes('password')) {
        setError('password', {
          type: 'pattern',
          message: t.auth.replace(error.message)
        })
      } else {
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

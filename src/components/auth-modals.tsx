import {
  type FieldErrorsImpl,
  type UseFormHandleSubmit,
  type UseFormRegister,
  useForm
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '~/components/button'
import { api } from '~/trpc/react'
import { signIn } from 'next-auth/react'
import { ErrorMessage } from '~/components/error-message-content'
import { toast } from 'react-hot-toast'
import { useRouter, useSearchParams } from 'next/navigation'
import { Modal } from './modal'
import { useState } from 'react'
import { useTranslations } from '~/hooks/use-translations'

export const signUpSchema = (t: any) =>
  z
    .object({
      email: z.string().email(t.auth.emailRequired),
      password: z.string().min(6, t.auth.minChars6).max(20, t.auth.maxChars20),
      confirm: z.string().min(6, t.auth.minChars6).max(20, t.auth.maxChars20)
    })
    .refine((data) => data.confirm === data.password, {
      message: t.auth.passwordsDontMatch,
      path: ['confirm']
    })

type SignUpSchemaType = z.infer<ReturnType<typeof signUpSchema>>

export function useSignUp(successCallback?: () => Promise<void>) {
  const t = useTranslations()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm<SignUpSchemaType>({
    resolver: zodResolver(signUpSchema(t))
  })
  const router = useRouter()

  const [isOpen, setIsOpen] = useState(false)

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
          message: error.message
        })
      } else if (error.message && error.message.includes('password')) {
        setError('password', {
          type: 'pattern',
          message: error.message
        })
      } else {
        toast.error(error.message)
      }
    }
  })

  const onSubmit = (values: SignUpSchemaType) => {
    mutate(values)
  }

  const handleOpen = () => {
    setIsOpen(true)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  return {
    register,
    handleSubmit,
    errors,
    isOpen,
    onSubmit,
    isLoading: isPending,
    handleOpen,
    handleClose
  }
}

export function SignUpModal({
  isOpen,
  closeModal,
  onSubmit,
  isLoading,
  errors,
  register,
  handleSubmit
}: {
  isOpen: boolean
  closeModal: () => void
  onSubmit: (data: SignUpSchemaType) => void
  isLoading: boolean
  errors: Partial<FieldErrorsImpl<SignUpSchemaType>>
  register: UseFormRegister<SignUpSchemaType>
  handleSubmit: UseFormHandleSubmit<SignUpSchemaType>
}) {
  const t = useTranslations()

  return (
    <Modal isOpen={isOpen} closeModal={closeModal}>
      <div className='prose mx-auto flex h-full flex-col items-center justify-center py-5'>
        <h1 className='px-5'>{t.auth.signUp}</h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='form-control'>
            <label htmlFor='email' className='label pb-1 pt-0'>
              <span className='label-text'>
                {t.auth.email}
                <span className='text-error'>*</span>
              </span>
            </label>

            <input
              className={`input input-bordered ${
                errors.email ? 'input-error' : ''
              }`}
              id='email'
              {...register('email')}
            />

            <ErrorMessage errors={errors} name='email' />
          </div>
          <div className='form-control'>
            <label htmlFor='password' className='label pb-1 pt-0'>
              <span className='label-text'>
                {t.auth.password}
                <span className='text-error'>*</span>
              </span>
            </label>

            <input
              className={`input input-bordered ${
                errors.password ? 'input-error' : ''
              }`}
              id='password'
              type='password'
              {...register('password')}
            />
            <ErrorMessage errors={errors} name='password' />
          </div>
          <div className='form-control'>
            <label htmlFor='confirmPassword' className='label pb-1 pt-0'>
              <span className='label-text'>
                {t.auth.confirmPassword}
                <span className='text-error'>*</span>
              </span>
            </label>

            <input
              className={`input input-bordered ${
                errors.confirm ? 'input-error' : ''
              }`}
              id='confirmPassword'
              type='password'
              {...register('confirm')}
            />

            <ErrorMessage errors={errors} name='confirm' />
          </div>

          <div className='flex w-full max-w-[300px] flex-col items-center gap-2'>
            <Button
              className='btn btn-primary w-3/4'
              type='submit'
              isLoading={isLoading}
            >
              {t.auth.signUp}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

export const loginSchema = (t: any) =>
  z.object({
    email: z.string().email(t.auth.emailRequired),
    password: z.string().min(1, t.required)
  })
type LoginSchemaType = z.infer<ReturnType<typeof loginSchema>>

export function useLogin() {
  const t = useTranslations()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [isOpen, setIsOpen] = useState(false)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema(t))
  })

  const onSubmit = async (data: LoginSchemaType) => {
    const path = searchParams.get('callbackUrl') as string | undefined
    const callback = path ? decodeURIComponent(path) : '/chat'

    const response = await signIn('credentials', { redirect: false, ...data })
    if (response?.ok && !response.error) {
      router.push(callback)
    }
    if (response?.status === 401 || response?.error) {
      toast.error(t.auth.invalidCreds)
      setError('email', { message: t.auth.invalidCreds })
      setError('password', { message: t.auth.invalidCreds })
    }
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  const handleOpen = () => {
    setIsOpen(true)
  }

  return {
    register,
    handleSubmit,
    errors,
    isOpen,
    onSubmit,
    isSubmitting,
    handleClose,
    handleOpen
  }
}

export function LoginModal({
  isOpen,
  closeModal,
  onSubmit,
  isSubmitting,
  errors,
  register,
  handleSubmit
}: {
  isOpen: boolean
  closeModal: () => void
  onSubmit: (data: LoginSchemaType) => void
  isSubmitting: boolean
  errors: Partial<FieldErrorsImpl<LoginSchemaType>>
  register: UseFormRegister<LoginSchemaType>
  handleSubmit: UseFormHandleSubmit<LoginSchemaType>
}) {
  const t = useTranslations()

  return (
    <Modal isOpen={isOpen} closeModal={closeModal}>
      <div className='prose mx-auto flex h-full flex-col items-center justify-center py-5'>
        <h1 className='text-center'>{t.auth.login}</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='form-control'>
            <label htmlFor='email' className='label pb-1'>
              <span className='label-text'>{t.auth.email}</span>
            </label>

            <input
              id='email'
              className={`input input-bordered ${
                errors.email ? 'input-error' : ''
              }`}
              {...register('email')}
            />

            <ErrorMessage errors={errors} name='email' />
          </div>

          <div className='form-control'>
            <label htmlFor='password' className='label pb-1'>
              <span className='label-text'>{t.auth.password}</span>
            </label>

            <input
              id='password'
              className={`input input-bordered ${
                errors.password ? 'input-error' : ''
              }`}
              type='password'
              {...register('password')}
            />

            <ErrorMessage errors={errors} name='password' />
          </div>
          <div className='mt-4 flex w-full max-w-[300px] flex-col items-center gap-2'>
            <Button
              isLoading={isSubmitting}
              type='submit'
              className='btn btn-primary w-3/4'
            >
              {t.auth.login}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

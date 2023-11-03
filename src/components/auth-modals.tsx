import {
  FieldErrorsImpl,
  UseFormHandleSubmit,
  UseFormRegister,
  useForm
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from 'components/button'
import { api } from 'utils/api'
import { signIn } from 'next-auth/react'
import { ErrorMessage } from 'components/error-message-content'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/router'
import { Modal } from './modal'
import { useState } from 'react'
import { useTranslation } from 'hooks/useTranslation'
import { TFunction } from 'i18next'

export const signUpSchema = (t: TFunction) =>
  z
    .object({
      email: z.string().email(t('auth.email-required')),
      password: z
        .string()
        .min(6, t('auth.min-chars-6'))
        .max(20, t('auth.max-chars-20')),
      confirm: z
        .string()
        .min(6, t('auth.min-chars-6'))
        .max(20, t('auth.max-chars-20'))
    })
    .refine((data) => data.confirm === data.password, {
      message: t('auth.passwords-dont-match'),
      path: ['confirm']
    })

type SignUpSchemaType = z.infer<ReturnType<typeof signUpSchema>>

export function useSignUp(successCallback?: () => void) {
  const t = useTranslation()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm<SignUpSchemaType>({
    resolver: zodResolver(signUpSchema(t))
  })
  const router = useRouter()

  // const { mutate: createChat } = api.chat.createPublic.useMutation()
  const [isOpen, setIsOpen] = useState(false)

  const { mutate, isLoading } = api.user.signUp.useMutation({
    onSuccess: async ({}, { email, password }) => {
      const response = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (successCallback) {
        successCallback()
      } else if (response?.ok) {
        router.push('/chat')

        toast.success(t('auth.sign-up-success'))
      }
    },
    onError: (error) => {
      if (error.message && error.shape?.code === -32009) {
        setError('email', {
          type: 'pattern',
          message: error.message
        })
      }
      if (error.message && error.message.includes('password')) {
        setError('password', {
          type: 'pattern',
          message: error.message
        })
      }
    }
  })

  const onSubmit = async (values: SignUpSchemaType) => {
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
    isLoading,
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
  const t = useTranslation()

  return (
    <Modal isOpen={isOpen} closeModal={closeModal}>
      <div className='prose mx-auto flex h-full flex-col items-center justify-center py-5'>
        <h1 className='px-5'>{t('auth.sign-up')}</h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='form-control'>
            <label htmlFor='email' className='label pb-1 pt-0'>
              <span className='label-text'>
                {t('auth.email')}
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
                {t('auth.password')}
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
                {t('auth.confirm-password')}
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
              {t('auth.sign-up')}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

export const loginSchema = (t: TFunction) =>
  z.object({
    email: z.string().email(t('auth.email-required')),
    password: z.string().min(1, t('required'))
  })
type LoginSchemaType = z.infer<ReturnType<typeof loginSchema>>

export function useLogin() {
  const t = useTranslation()

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
    const response = await signIn('credentials', { redirect: false, ...data })
    if (response?.ok) {
      router.push('/chat')
    }

    if (response?.status === 401) {
      toast.error(t('auth.invalid-creds'))

      setError('email', { message: t('auth.invalid-creds') })
      setError('password', { message: t('auth.invalid-creds') })
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
  const t = useTranslation()

  return (
    <Modal isOpen={isOpen} closeModal={closeModal}>
      <div className='prose mx-auto flex h-full flex-col items-center justify-center py-5'>
        <h1 className='text-center'>{t('auth.login')}</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='form-control'>
            <label htmlFor='email' className='label pb-1'>
              <span className='label-text'>{t('auth.email')}</span>
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
              <span className='label-text'>{t('auth.password')}</span>
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
              {t('auth.login')}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

import {
  FieldErrorsImpl,
  UseFormHandleSubmit,
  UseFormRegister,
  useForm
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from 'components/Button'
import { api } from 'utils/api'
import { signIn } from 'next-auth/react'
import { ErrorMessage } from 'components/ErrorMessageContent'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/router'
import { Modal } from './Modal'
import { useState } from 'react'

export const signUpSchema = z
  .object({
    email: z.string().email(),
    password: z
      .string()
      .min(6, 'Needs at least 6 characters')
      .max(20, 'Needs at most 20 characters'),
    confirm: z
      .string()
      .min(6, 'Needs at least 6 characters')
      .max(20, 'Needs at most 20 characters')
  })
  .refine((data) => data.confirm === data.password, {
    message: "Passwords don't match",
    path: ['confirm']
  })

type SignUpSchemaType = z.infer<typeof signUpSchema>

export function useSignUp() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm<SignUpSchemaType>({
    resolver: zodResolver(signUpSchema)
  })
  const router = useRouter()

  // const { mutate: createChat } = api.chat.createPublic.useMutation()
  const [isOpen, setIsOpen] = useState(false)

  const { mutate, isLoading } = api.auth.signUp.useMutation({
    onSuccess: async ({}, { email, password }) => {
      const response = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (response?.ok) {
        router.push('/chat')

        toast.success('Signed up successfully')
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
  return (
    <Modal isOpen={isOpen} closeModal={closeModal}>
      <div className='prose mx-auto flex h-full flex-col items-center justify-center py-5'>
        <h1 className='px-5'>Sign up</h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='form-control'>
            <label htmlFor='email' className='label pb-1 pt-0'>
              <span className='label-text'>Email</span>
            </label>
            <input
              className={`input-bordered input ${
                errors.email ? 'input-error' : ''
              }`}
              id='email'
              {...register('email')}
            />
            <ErrorMessage errors={errors} name='email' />
          </div>
          <div className='form-control'>
            <label htmlFor='password' className='label pb-1 pt-0'>
              <span className='label-text'>Password</span>
            </label>
            <input
              className={`input-bordered input ${
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
              <span className='label-text'>Confirm Password</span>
            </label>
            <input
              className={`input-bordered input ${
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
              className='btn-primary btn w-3/4'
              type='submit'
              isLoading={isLoading}
            >
              Sign up
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4).max(14)
})
type LoginSchemaType = z.infer<typeof loginSchema>

export function useLogin() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginSchemaType) => {
    const response = await signIn('credentials', { redirect: false, ...data })
    if (response?.ok) {
      router.push('/chat')
    }

    if (response?.status === 401) {
      toast.error('Invalid credentials')

      setError('email', { message: 'Invalid credentials' })
      setError('password', { message: 'Invalid credentials' })
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
  return (
    <Modal isOpen={isOpen} closeModal={closeModal}>
      <div className='prose mx-auto flex h-full flex-col items-center justify-center py-5'>
        <h1 className='text-center'>Login</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='form-control'>
            <label htmlFor='email' className='label pb-1'>
              <span className='label-text'>Email</span>
            </label>
            <input
              id='email'
              className={`input-bordered input ${
                errors.email ? 'input-error' : ''
              }`}
              {...register('email')}
            />
          </div>
          <div className='form-control'>
            <label htmlFor='password' className='label pb-1'>
              <span className='label-text'>Password</span>
            </label>
            <input
              id='password'
              className={`input-bordered input ${
                errors.password ? 'input-error' : ''
              }`}
              type='password'
              {...register('password')}
            />
          </div>
          <div className='mt-4 flex w-full max-w-[300px] flex-col items-center gap-2'>
            <Button
              isLoading={isSubmitting}
              type='submit'
              className='btn-primary btn w-3/4'
            >
              Login
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

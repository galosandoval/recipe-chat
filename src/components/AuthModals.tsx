import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from 'components/Button'
import { api } from 'utils/api'
import { signIn } from 'next-auth/react'
import { ErrorMessage } from 'components/ErrorMessageContent'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/router'
import { Modal } from './Modal'
import { forwardRef, useState } from 'react'

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
// eslint-disable-next-line @typescript-eslint/ban-types

// eslint-disable-next-line react/display-name
export const SignUpModal = forwardRef<HTMLDivElement>((_p, ref) => {
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
      console.log('error', error)
    }
  })

  const onSubmit = async (values: SignUpSchemaType) => {
    mutate(values)
  }

  return (
    <div ref={ref}>
      <Button
        className='btn-ghost btn w-full whitespace-nowrap'
        onClick={() => setIsOpen(true)}
      >
        Sign up
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
            d='M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z'
          />
        </svg>
      </Button>
      <Modal isOpen={isOpen} closeModal={() => setIsOpen(false)}>
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
              {/* <Link href='/' className='link-primary link'>
            Back
          </Link> */}
            </div>
          </form>
        </div>
      </Modal>
    </div>
  )
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4).max(14)
})
type LoginSchemaType = z.infer<typeof loginSchema>

// eslint-disable-next-line react/display-name
export const LoginModal = forwardRef<HTMLDivElement>((_, ref) => {
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

  return (
    <div ref={ref}>
      <Button className='btn-ghost btn w-full' onClick={() => setIsOpen(true)}>
        Log in
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
            d='M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9'
          />
        </svg>
      </Button>
      <Modal isOpen={isOpen} closeModal={() => setIsOpen(false)}>
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
    </div>
  )
})

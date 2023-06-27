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
import { useState } from 'react'
import { Message } from '@prisma/client'

export function AuthModal({
  isOpen,
  // TODO: use content to save recipe after logging in or signing up
  messages,
  closeModal
}: {
  isOpen: boolean
  messages?: Message[]
  closeModal: () => void
}) {
  let toRender: React.ReactNode = null
  const [isLogin, setIsLogin] = useState(false)

  if (isLogin) {
    toRender = <Login />
  } else {
    toRender = <SignUp />
  }

  return (
    <Modal isOpen={isOpen} closeModal={closeModal}>
      {toRender}
      <div className='flex w-full justify-center'>
        <button
          className='link-primary link mx-auto mt-1 pb-5'
          onClick={() => setIsLogin((state) => !state)}
        >
          {isLogin ? 'Sign up' : 'Login'}
        </button>
      </div>
    </Modal>
  )
}

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

function SignUp() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    setError
  } = useForm<SignUpSchemaType>({
    resolver: zodResolver(signUpSchema)
  })
  const router = useRouter()

  const { mutate: createChat } = api.chat.createPublic.useMutation()

  const { mutate, isLoading } = api.auth.signUp.useMutation({
    onSuccess: async ({ id }, { email, password }) => {
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
    <div className='prose mx-auto flex h-full flex-col items-center justify-center pt-5'>
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
  )
}

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4).max(14)
})
type LoginSchemaType = z.infer<typeof loginSchema>

function Login() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
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
    <>
      <div className='prose mx-auto flex h-full flex-col items-center justify-center pt-5'>
        <h1 className='text-center'>Welcome to RecipeChat</h1>
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
            <Button type='submit' className='btn-primary btn w-3/4'>
              Login
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}

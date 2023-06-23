import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from 'components/Button'
import { api } from 'utils/api'
import { signIn } from 'next-auth/react'
import { MyHead } from 'components/Head'
import { ErrorMessage } from 'components/ErrorMessageContent'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/router'
import { maxChars, minChars } from 'server/api/routers/authRouter'

export const signUpSchema = z
  .object({
    email: z.string().email(),
    password: z
      .string()
      .min(minChars, `Needs at least ${minChars} characters`)
      .max(maxChars, `Needs at most ${maxChars} characters`),
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

export default function SignUpView() {
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
  const { mutate, isLoading } = api.auth.signUp.useMutation({
    onSuccess: async () => {
      const creds = getValues()
      const response = await signIn(
        'credentials',

        {
          ...creds,
          redirect: false
        }
      )

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

  return (
    <>
      <MyHead title='Listy - Dashboard' />
      <main className='h-screen'>
        <div className='prose mx-auto flex h-full flex-col items-center justify-center'>
          <h1 className='px-5'>Sign up</h1>

          <form className='' onSubmit={handleSubmit(onSubmit)}>
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
            <div className='flex w-full max-w-[200px] flex-col items-center gap-2'>
              <Button
                className='btn-primary btn w-3/4'
                type='submit'
                isLoading={isLoading}
              >
                Sign up
              </Button>
              <Link href='/' className='link-primary link'>
                Back
              </Link>
            </div>
          </form>
        </div>
      </main>
    </>
  )
}

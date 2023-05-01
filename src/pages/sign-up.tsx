import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from 'components/Button'
import { ErrorMessage } from '@hookform/error-message'
import { api } from 'utils/api'
import { signIn } from 'next-auth/react'
import { MyHead } from 'components/Head'

export const signUpSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(4).max(14),
    confirm: z.string().min(4).max(14)
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
    getValues
  } = useForm<SignUpSchemaType>({
    resolver: zodResolver(signUpSchema)
  })
  const { mutate } = api.auth.signUp.useMutation({
    onSuccess: async () => {
      const { email, password } = getValues()
      await signIn(
        'credentials',
        {
          callbackUrl: process.env.VERCEL_URL
            ? process.env.VERCEL_URL
            : 'http://localhost:3000/'
        },
        {
          email,
          password
        }
      )
    }
  })

  const onSubmit = async (values: SignUpSchemaType) => {
    mutate(values)
  }

  return (
    <>
      <MyHead title='Listy - Dashboard' />
      <main className='h-screen h-screen-ios'>
        <form
          className='flex h-full flex-col items-center justify-center gap-2'
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className='form-control'>
            <label htmlFor='email' className='label'>
              <span className='label-text'>Email</span>
            </label>
            <input
              className='input-bordered input'
              id='email'
              type='email'
              {...register('email')}
            />
            <ErrorMessage
              errors={errors}
              name='email'
              render={({ message }) => <p>{message}</p>}
            />
          </div>
          <div className='form-control'>
            <label htmlFor='password' className='label'>
              <span className='label-text'>Password</span>
            </label>
            <input
              className='input-bordered input'
              id='password'
              type='password'
              {...register('password')}
            />
            <ErrorMessage
              errors={errors}
              name='password'
              render={({ message }) => <p>{message}</p>}
            />
          </div>
          <div className='form-control'>
            <label htmlFor='confirmPassword' className='label'>
              <span className='label-text'>Confirm Password</span>
            </label>
            <input
              className='input-bordered input'
              id='confirmPassword'
              type='password'
              {...register('confirm')}
            />
            <ErrorMessage
              errors={errors}
              name='confirm'
              render={({ message }) => <p>{message}</p>}
            />
          </div>

          <Button className='btn-primary btn' type='submit'>
            Sign up
          </Button>
        </form>
      </main>
    </>
  )
}

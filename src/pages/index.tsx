import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'
import { z } from 'zod'
import Link from 'next/link'
import { Button } from 'components/Button'
import { MyHead } from 'components/Head'
import { useRouter } from 'next/router'
import { toast } from 'react-hot-toast'

export const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4).max(14)
})

type AuthSchemaType = z.infer<typeof authSchema>

export default function LandingView() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<AuthSchemaType>({
    resolver: zodResolver(authSchema)
  })

  const onSubmit = async (data: AuthSchemaType) => {
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
      <MyHead title='Listy - Create recipes using AI | Powered by OpenAI | ChatGPT' />
      <main className='h-screen'>
        <div className='prose mx-auto flex h-full flex-col items-center justify-center'>
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
            <div className='mt-4 flex w-full max-w-[200px] flex-col items-center gap-2'>
              <Button type='submit' className='btn-primary btn w-3/4'>
                Login
              </Button>
              <Link className='link' href='/sign-up'>
                Sign up
              </Link>
            </div>
          </form>
        </div>
      </main>
    </>
  )
}

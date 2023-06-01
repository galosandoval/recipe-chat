import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn, useSession } from 'next-auth/react'
import { z } from 'zod'
import Link from 'next/link'
import GenerateRecipe from './_chat'
import { Button } from 'components/Button'
import { MyHead } from 'components/Head'

export const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4).max(14)
})

type AuthSchemaType = z.infer<typeof authSchema>

export default function LandingView() {
  const { status } = useSession()
  const { register, handleSubmit } = useForm<AuthSchemaType>({
    resolver: zodResolver(authSchema)
  })

  const onSubmit = async (data: AuthSchemaType) => {
    await signIn('credentials', { ...data })
  }

  if (status === 'authenticated') {
    return (
      <>
        <MyHead title='Listy - Dashboard' />
        <GenerateRecipe />
      </>
    )
  }

  return (
    <>
      <MyHead title='Listy - Create recipes using AI | Powered by OpenAI | ChatGPT' />
      <main className='h-screen h-screen-ios'>
        <form
          className='container flex h-full flex-col items-center justify-center gap-4'
          onSubmit={handleSubmit(onSubmit)}
        >
          <div>
            <div className='form-control'>
              <label htmlFor='login' className='label'>
                <span className='label-text'>Email</span>
              </label>
              <input
                id='login'
                className='input-bordered input'
                type='email'
                {...register('email')}
              />
            </div>
            <div className='form-control'>
              <label htmlFor='password' className='label'>
                <span className='label-text'>Password</span>
              </label>
              <input
                id='password'
                className='input-bordered input'
                type='password'
                {...register('password')}
              />
            </div>
          </div>
          <div className='flex flex-col'>
            <Button type='submit' className='btn-primary btn'>
              Login
            </Button>
            <Link className='link' href='/sign-up'>
              Sign up
            </Link>
          </div>
        </form>
      </main>
    </>
  )
}

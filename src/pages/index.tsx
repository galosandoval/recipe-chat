import Head from 'next/head'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn, useSession } from 'next-auth/react'
import { z } from 'zod'
import { Button } from '../components/Button'
import Link from 'next/link'
import Layout from '../components/Layout'
import { GenerateRecipe } from '../features/recipes/Generate'

export const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4).max(14)
})

type AuthSchemaType = z.infer<typeof authSchema>

export default function Landing() {
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
        <Head>
          <title>Listy - Dashboard</title>
          <meta name='description' content='Generated by create-t3-app' />
          <link rel='icon' href='/favicon.ico' />
        </Head>
        <Layout>
          <>
            <GenerateRecipe />
          </>
        </Layout>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Listy - Sign Up</title>
        <meta name='description' content='Generated by create-t3-app' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <main>
        <form onSubmit={handleSubmit(onSubmit)}>
          <input type='email' {...register('email')} />
          <input type='password' {...register('password')} />

          <Button>Login</Button>
          <Link href='/sign-up'>Sign up</Link>
        </form>
      </main>
    </>
  )
}

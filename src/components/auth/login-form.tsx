'use client'

import { useTranslations } from '~/hooks/use-translations'
import { Form, FormInput } from '../form'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signIn } from '~/server/auth'
import { toast } from '../toast'

export const loginSchema = (t: any) =>
  z.object({
    email: z.string().email(t.auth.emailRequired),
    password: z.string().min(1, t.required)
  })
type LoginSchemaType = z.infer<ReturnType<typeof loginSchema>>

export function LoginForm() {
  const t = useTranslations()
  const searchParams = useSearchParams()
  const router = useRouter()

  const form = useForm<LoginSchemaType>({
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
      form.setError('email', { message: t.auth.invalidCreds })
      form.setError('password', { message: t.auth.invalidCreds })
    }
  }
  return (
    <Form
      onSubmit={onSubmit}
      className='flex flex-col gap-3'
      formId='login'
      form={form}
    >
      <FormInput name='email' label={t.auth.email} />
      <FormInput name='password' type='password' label={t.auth.password} />
    </Form>
  )
}

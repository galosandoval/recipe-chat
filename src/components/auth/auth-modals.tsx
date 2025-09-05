import { api } from '~/trpc/react'
import { signIn } from 'next-auth/react'
import { toast } from '~/components/toast'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from '~/hooks/use-translations'
import { chatStore } from '~/stores/chat-store'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DrawerDialog } from '../drawer-dialog'
import { Form, FormInput } from '../form'
import { signUpSchema, type SignUpSchema } from '~/schemas/sign-up-schema'
import type { MessageWithRecipes } from '~/schemas/chats-schema'

export function SignUpDrawerDialog({
  trigger,
  open,
  onOpenChange
}: {
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const t = useTranslations()
  const router = useRouter()
  const form = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema)
  })

  const { mutate } = api.users.signUp.useMutation({
    onSuccess: async ({}, { email, password }) => {
      const response = await signIn('credentials', {
        email,
        password,
        redirect: false
      })
      const lastMessage = messages.at(-1)
      if (lastMessage) {
        onSignUpSuccess(lastMessage)
      } else if (response?.ok) {
        router.push('/chat')

        toast.success(t.auth.signUpSuccess)
      }
    },
    onError: (error) => {
      if (error.message && error.shape?.code === -32009) {
        form.setError('email', {
          type: 'pattern',
          message: t.auth.replace(error.message)
        })
      } else if (error.message && error.message.includes('password')) {
        form.setError('password', {
          type: 'pattern',
          message: t.auth.replace(error.message)
        })
      } else {
        toast.error(error.message)
      }
    }
  })

  const onSubmit = (values: SignUpSchema) => {
    mutate(values)
  }
  const { messages } = chatStore()
  const { mutateAsync: createChatAndRecipeAsync } =
    api.users.createChatAndRecipe.useMutation({
      onError: (error) => {
        toast.error('Error: ' + error.message)
      }
    })

  async function onSignUpSuccess(lastMessage: MessageWithRecipes) {
    const recipe = lastMessage.recipes?.[0]
    if (!recipe) {
      console.warn('No recipe')
      return
    }
    const newRecipePromise = createChatAndRecipeAsync({
      recipe: {
        name: recipe.name,
        description: recipe.description ?? '',
        ingredients: recipe.ingredients ?? [],
        instructions: recipe.instructions ?? [],
        prepMinutes: recipe.prepMinutes ?? undefined,
        cookMinutes: recipe.cookMinutes ?? undefined
      },
      messages
    })
    const user = await toast.promise(newRecipePromise, {
      loading: t.loading.loggingIn,
      success: () => t.toast.loginSuccess,
      error: () => t.error.somethingWentWrong
    })
    router.push(`recipes/${user.recipes.id}}`)
  }

  return (
    <DrawerDialog
      title={t.auth.signUp}
      description={t.auth.signUpDescription}
      trigger={trigger}
      cancelText={t.common.cancel}
      submitText={t.auth.signUp}
      formId='signUp'
      open={open}
      onOpenChange={onOpenChange}
    >
      <Form
        onSubmit={onSubmit}
        className='flex flex-col gap-3'
        formId='signUp'
        form={form}
      >
        <FormInput name='email' label={t.auth.email} />
        <FormInput name='password' label={t.auth.password} />
        <FormInput name='confirm' label={t.auth.confirmPassword} />
      </Form>
    </DrawerDialog>
  )
}

export const loginSchema = (t: any) =>
  z.object({
    email: z.string().email(t.auth.emailRequired),
    password: z.string().min(1, t.required)
  })
type LoginSchemaType = z.infer<ReturnType<typeof loginSchema>>

export function LoginDrawerDialog({
  trigger,
  open,
  onOpenChange
}: {
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
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
    <DrawerDialog
      title={t.auth.login}
      description={t.auth.loginDescription}
      trigger={trigger}
      cancelText={t.common.cancel}
      submitText={t.auth.login}
      formId='login'
      open={open}
      onOpenChange={onOpenChange}
    >
      <Form
        onSubmit={onSubmit}
        className='flex flex-col gap-3'
        formId='login'
        form={form}
      >
        <FormInput name='email' label={t.auth.email} />
        <FormInput name='password' type='password' label={t.auth.password} />
      </Form>
    </DrawerDialog>
  )
}
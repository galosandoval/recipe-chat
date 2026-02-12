'use client'

import { useTranslations } from '~/hooks/use-translations'
import { Form } from '../form/form'
import { FormInput } from '../form/form-input'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'
import { toast } from '../toast'
import { signUpSchema, type SignUpSchema } from '~/schemas/sign-up-schema'
import { api } from '~/trpc/react'
import { chatStore } from '~/stores/chat-store'
import type { MessageWithRecipes } from '~/schemas/chats-schema'
import { DrawerDialog } from '../drawer-dialog'
import { UserPlusIcon } from 'lucide-react'

export function SignUp({
  trigger,
  title,
  description,
  open,
  onOpenChange
}: {
  trigger?: React.ReactNode
  title?: string
  description?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const t = useTranslations()
  const router = useRouter()
  const form = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema)
  })

  const { mutate, isPending } = api.users.signUp.useMutation({
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
    const result = await toast.promise(newRecipePromise, {
      loading: t.loading.loggingIn,
      success: () => t.toast.loginSuccess,
      error: () => t.error.somethingWentWrong
    })
    const newUser = await result.unwrap()
    router.push(`recipes/${newUser.slug}}`)
  }

  return (
    <DrawerDialog
      title={title ?? t.auth.signUp}
      description={description ?? t.auth.signUpDescription}
      trigger={trigger}
      cancelText={t.common.cancel}
      submitText={t.auth.signUp}
      formId='signUp'
      open={open}
      onOpenChange={onOpenChange}
      isLoading={isPending}
      submitIcon={<UserPlusIcon />}
    >
      <Form
        onSubmit={onSubmit}
        className='flex flex-col gap-3'
        formId='signUp'
        form={form}
      >
        <FormInput name='email' label={t.auth.email} />
        <FormInput type='password' name='password' label={t.auth.password} />
        <FormInput
          type='password'
          name='confirm'
          label={t.auth.confirmPassword}
        />
      </Form>
    </DrawerDialog>
  )
}

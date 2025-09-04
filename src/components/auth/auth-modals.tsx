import { api } from '~/trpc/react'
import { signIn } from 'next-auth/react'
import {
  ErrorMessage,
  type ErrorMessageProps
} from '~/components/error-message-content'
import { toast } from '~/components/toast'
import { useRouter, useSearchParams } from 'next/navigation'
import { Modal } from '../modal'
import { createContext, useContext, useState } from 'react'
import { useTranslations } from '~/hooks/use-translations'
import { chatStore } from '~/stores/chat-store'
import {
  useForm,
  type FieldErrors,
  type FieldValues,
  type Path,
  type UseFormRegister
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSignUp } from './sign-up'
import { Button } from '../ui/button'

const inputNames = ['email', 'password', 'confirm'] as const
const translationKeys = {
  email: 'auth.email',
  password: 'auth.password',
  confirm: 'auth.confirmPassword'
} as const

export function SignUpModal() {
  const t = useTranslations()
  const router = useRouter()
  const { isSignUpOpen, handleCloseSignUp } = useAuthModal()
  const { errors, isLoading, handleSubmit, onSubmit, register } =
    useSignUp(onSignUpSuccess)
  const { messages } = chatStore()
  const { mutateAsync: createChatAndRecipeAsync } =
    api.users.createChatAndRecipe.useMutation({
      onError: (error) => {
        toast.error('Error: ' + error.message)
      }
    })

  async function onSignUpSuccess() {
    // TODO - this is a hack to get the selected recipe to save
    const lastMessage = messages.at(-1)
    if (!lastMessage) {
      console.warn('No last message')
      return
    }
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
    <Modal isOpen={isSignUpOpen} closeModal={handleCloseSignUp}>
      <div className='mx-auto flex h-full flex-col items-center justify-center py-5'>
        <h1 className='px-5'>{t.auth.signUp}</h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          {inputNames.map((name) => (
            <FormControl
              key={name}
              errors={errors}
              register={register}
              label={t.get(translationKeys[name])}
              isError={errors[name]}
            />
          ))}
          <FormControl
            errors={errors}
            register={register}
            label={t.auth.email}
            isError={errors.email}
          />
          <div className='form-control'>
            <label htmlFor='email' className='label pt-0 pb-1'>
              <span className='label-text'>
                {t.auth.email}
                <span className='text-error'>*</span>
              </span>
            </label>

            <input
              className={`input input-bordered ${
                errors.email ? 'input-error' : ''
              }`}
              id='email'
              {...register('email')}
            />

            <ErrorMessage errors={errors} name='email' />
          </div>
          <div className='form-control'>
            <label htmlFor='password' className='label pt-0 pb-1'>
              <span className='label-text'>
                {t.auth.password}
                <span className='text-error'>*</span>
              </span>
            </label>

            <input
              className={`input input-bordered ${
                errors.password ? 'input-error' : ''
              }`}
              id='password'
              type='password'
              {...register('password')}
            />
            <ErrorMessage errors={errors} name='password' />
          </div>
          <div className='form-control'>
            <label htmlFor='confirmPassword' className='label pt-0 pb-1'>
              <span className='label-text'>
                {t.auth.confirmPassword}
                <span className='text-error'>*</span>
              </span>
            </label>

            <input
              className={`input input-bordered ${
                errors.confirm ? 'input-error' : ''
              }`}
              id='confirmPassword'
              type='password'
              {...register('confirm')}
            />

            <ErrorMessage errors={errors} name='confirm' />
          </div>

          <div className='flex w-full max-w-[300px] flex-col items-center gap-2'>
            <Button className='w-3/4' type='submit' isLoading={isLoading}>
              {t.auth.signUp}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

function FormControl<T extends FieldValues>({
  errors,
  register,
  label,
  isError
}: {
  errors: Partial<FieldErrors<T>>
  register: UseFormRegister<T>
  label: string
  isError: any
}) {
  return (
    <div className='form-control'>
      <label htmlFor='email' className='label pt-0 pb-1'>
        <span className='label-text'>
          {label}
          <span className='text-error'>*</span>
        </span>
      </label>

      <input
        className={`input input-bordered ${isError ? 'input-error' : ''}`}
        id='email'
        {...register(label as Path<T>)}
      />

      <ErrorMessage
        errors={errors}
        name={label as ErrorMessageProps<T>['name']}
      />
    </div>
  )
}

export const loginSchema = (t: any) =>
  z.object({
    email: z.string().email(t.auth.emailRequired),
    password: z.string().min(1, t.required)
  })
type LoginSchemaType = z.infer<ReturnType<typeof loginSchema>>

export function useLogin() {
  const t = useTranslations()
  const searchParams = useSearchParams()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<LoginSchemaType>({
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
      setError('email', { message: t.auth.invalidCreds })
      setError('password', { message: t.auth.invalidCreds })
    }
  }
  return {
    register,
    handleSubmit,
    errors,
    onSubmit,
    isSubmitting
  }
}

export function LoginModal() {
  const t = useTranslations()
  const { isLoginOpen, handleCloseLogin } = useAuthModal()
  const { handleSubmit, errors, register, isSubmitting, onSubmit } = useLogin()

  return (
    <Modal isOpen={isLoginOpen} closeModal={handleCloseLogin}>
      <div className='mx-auto flex h-full flex-col items-center justify-center py-5'>
        <h1 className='text-center'>{t.auth.login}</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='form-control'>
            <label htmlFor='email' className='label pb-1'>
              <span className='label-text'>{t.auth.email}</span>
            </label>

            <input
              id='email'
              className={`input input-bordered ${
                errors.email ? 'input-error' : ''
              }`}
              {...register('email')}
            />

            <ErrorMessage errors={errors} name='email' />
          </div>

          <div className='form-control'>
            <label htmlFor='password' className='label pb-1'>
              <span className='label-text'>{t.auth.password}</span>
            </label>

            <input
              id='password'
              className={`input input-bordered ${
                errors.password ? 'input-error' : ''
              }`}
              type='password'
              {...register('password')}
            />

            <ErrorMessage errors={errors} name='password' />
          </div>
          <div className='mt-4 flex w-full max-w-[300px] flex-col items-center gap-2'>
            <Button isLoading={isSubmitting} type='submit' className='w-3/4'>
              {t.auth.login}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

export const AuthModalContext = createContext<{
  isSignUpOpen: boolean
  isLoginOpen: boolean
  handleCloseSignUp: () => void
  handleOpenSignUp: () => void
  handleCloseLogin: () => void
  handleOpenLogin: () => void
}>({
  isSignUpOpen: false,
  isLoginOpen: false,
  handleCloseSignUp: () => {},
  handleOpenSignUp: () => {},
  handleCloseLogin: () => {},
  handleOpenLogin: () => {}
})

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isSignUpOpen, setIsSignUpOpen] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)

  const handleCloseSignUp = () => {
    setIsSignUpOpen(false)
  }

  const handleOpenSignUp = () => {
    setIsSignUpOpen(true)
  }

  const handleCloseLogin = () => {
    setIsLoginOpen(false)
  }

  const handleOpenLogin = () => {
    setIsLoginOpen(true)
  }
  return (
    <AuthModalContext.Provider
      value={{
        isSignUpOpen,
        handleCloseSignUp,
        handleOpenSignUp,
        isLoginOpen,
        handleCloseLogin,
        handleOpenLogin
      }}
    >
      {children}
    </AuthModalContext.Provider>
  )
}

export const useAuthModal = () => {
  return useContext(AuthModalContext)
}

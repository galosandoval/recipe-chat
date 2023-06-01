import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/router'
import { FormValues } from 'pages/_generate'
import {
  Dispatch,
  MouseEvent,
  SetStateAction,
  useEffect,
  useState
} from 'react'
import { useForm } from 'react-hook-form'
import { GeneratedRecipe, Message } from 'server/api/routers/recipe/interface'
import { api } from 'utils/api'
import { z } from 'zod'

const useGenerate = () => {
  return api.recipe.generate
    .useMutation
    // {
    //   onSuccess: (data) => {
    //     setEnabled(false)
    //   }
    // }
    ()
}

export type UseGenerate = ReturnType<typeof useGenerate>

export const useGenerateRecipe = () => {
  const {
    register,
    handleSubmit,
    formState: { isDirty, isValid, isSubmitting },
    setValue,
    clearErrors,
    reset,
    getValues
  } = useForm<GenerateRecipeParams>({
    resolver: zodResolver(generateRecipeFormSchema)
  })
  const utils = api.useContext()
  utils.recipe.entity.prefetch()

  const prompt = getValues().message
  const { mutate, data, status } = useGenerate()

  const [chatBubbles, setChatBubbles] = useState(
    data?.messages ? data.messages : []
  )
  // const [messages, setMessages] = useState<Message[]>([])

  const handleFillMessage = (e: MouseEvent<HTMLButtonElement>) => {
    setValue('message', e.currentTarget.innerText.toLowerCase(), {
      shouldValidate: true,
      shouldDirty: true
    })
    clearErrors()
  }

  // const handleAddToMessages = (message: Message) => {
  //   setMessages((state) => [...state, message])
  // }

  const onSubmit = (values: GenerateRecipeParams) => {
    // handleAddToMessages({ content: values.message, role: 'user' })
    setChatBubbles((state) => [
      ...state,
      {
        content: values.message,
        role: 'user'
      }
    ])
    reset()

    const convo = data?.messages.map((m) => {
      let content: string
      if (typeof m.content === 'string') {
        content = m.content
      } else {
        content = JSON.stringify(m.content)
      }

      return { ...m, content }
    })
    mutate({ content: values.message, messages: convo })
    // setChatBubbles((state) => [
    //   ...state,
    //   {
    //     from: 'chat',
    //     timeStamp: new Date().toISOString(),
    //     value: (
    //       <RecipeChatBubble
    //         // messages={messages}
    //         // handleAddToMessages={handleAddToMessages}
    //         prompt={values.message}
    //         messages={undefined}
    //       />
    //     )
    //   }
    // ])
  }

  return {
    isDirty,
    isValid,
    chatBubbles,
    conversation: { data, status },
    prompt: isSubmitting ? prompt : null,
    handleFillMessage,
    onSubmit,
    handleSubmit,
    register
  }
}

const generateRecipeFormSchema = z.object({ message: z.string().min(6) })
export type GenerateRecipeParams = z.infer<typeof generateRecipeFormSchema>

export const useCreateGeneratedRecipe = (data: GeneratedRecipe) => {
  const router = useRouter()
  const utils = api.useContext()
  const { description, ingredients, instructions, name, cookTime, prepTime } =
    data
  const { mutate, isLoading, isSuccess } = api.recipe.create.useMutation({
    onSuccess: (data) => {
      router.push(`recipes/${data.id}?name=${encodeURIComponent(data.name)}`)
      utils.recipe.invalidate()
    }
  })

  const { handleSubmit, register, getValues } = useForm<FormValues>({
    defaultValues: {
      description,
      ingredients: ingredients?.join('\n'),
      instructions: instructions?.join('\n'),
      name,
      cookTime,
      prepTime
    }
  })

  const onSubmit = (values: FormValues) => {
    const ingredients = values.ingredients.split('\n')
    const instructions = values.instructions.split('\n')
    mutate({ ...values, ingredients, instructions })
  }

  return {
    isLoading,
    isSuccess,
    mutate,
    getValues,
    onSubmit,
    handleSubmit,
    register
  }
}

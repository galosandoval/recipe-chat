import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/router'
import { FormValues } from 'pages/_chat'
import { MouseEvent, useReducer, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { GeneratedRecipe, Message } from 'server/api/routers/recipe/interface'
import { api } from 'utils/api'
import { z } from 'zod'

type ChatAction = {
  type: 'add' | 'loadingResponse' | 'loaded'
  payload: Message & { error?: string; isLoading?: boolean }
}

type ChatState = {
  messages: Message[]
}

function chatReducer(state: ChatState, action: ChatAction) {
  const { type, payload } = action
  switch (type) {
    case 'add':
      return {
        ...state,
        messages: [...state.messages, payload]
      }

    case 'loadingResponse':
      return {
        ...state,
        messages: [...state.messages, payload]
      }

    case 'loaded':
      const newMessages = state.messages.slice(0, -1)
      return {
        ...state,
        messages: [...newMessages, payload]
      }

    default:
      return state
  }
}

function useChatReducer(initialState: ChatState) {
  const [state, dispatch] = useReducer(chatReducer, initialState)
  return [state, dispatch] as const
}

export const errorMessage = 'Please try rephrasing your request.'

function useAddMessageMutation(
  dispatch: React.Dispatch<ChatAction>,
  handleScrollIntoView: () => void
) {
  return api.recipe.generate.useMutation({
    onSuccess: (data) => {
      const newMessage = data.messages.at(-1)
      if (newMessage) {
        dispatch({ type: 'loaded', payload: newMessage })
      }
    },
    onError: () => {
      dispatch({
        type: 'loaded',
        payload: {
          content: '',
          role: 'assistant',
          error: errorMessage
        }
      })
    },
    onMutate: () => handleScrollIntoView(),
    onSettled: () => handleScrollIntoView()
  })
}

export type UseGenerate = ReturnType<typeof useAddMessageMutation>

export const AddMessage = () => {
  const [chatBubbles, dispatch] = useChatReducer({ messages: [] })
  const {
    register,
    handleSubmit,
    formState: { isDirty, isValid },
    setValue,
    clearErrors,
    reset
  } = useForm<ChatRecipeParams>({
    resolver: zodResolver(addMessageFormSchema)
  })

  const utils = api.useContext()
  utils.recipe.entity.prefetch()

  const chatRef = useRef<HTMLDivElement>(null)

  const handleScrollIntoView = () => {
    chatRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const { mutate, data } = useAddMessageMutation(dispatch, handleScrollIntoView)

  const handleFillMessage = (e: MouseEvent<HTMLButtonElement>) => {
    setValue('message', e.currentTarget.innerText.toLowerCase(), {
      shouldValidate: true,
      shouldDirty: true
    })
    clearErrors()
  }

  const onSubmit = (values: ChatRecipeParams) => {
    dispatch({
      type: 'add',
      payload: { content: values.message, role: 'user' }
    })

    dispatch({
      type: 'loadingResponse',
      payload: { content: '', role: 'assistant', isLoading: true }
    })

    reset()

    const convo = data?.messages
      .map((m) => {
        let content: string
        if (typeof m.content === 'string') {
          content = m.content
        } else {
          content = JSON.stringify(m.content)
        }

        return { ...m, content }
      })
      .filter((m) => m.content !== '')

    mutate({ content: values.message, messages: convo })
  }

  return {
    isDirty,
    isValid,
    chatBubbles,
    chatRef,
    handleFillMessage,
    onSubmit,
    handleSubmit,
    register
  }
}

const addMessageFormSchema = z.object({ message: z.string().min(6) })
export type ChatRecipeParams = z.infer<typeof addMessageFormSchema>

export const useCreateRecipe = (data: GeneratedRecipe) => {
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

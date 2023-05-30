import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/router'
import { FormValues } from 'pages/_generate'
import { MouseEvent, useState } from 'react'
import { useForm } from 'react-hook-form'
import { GeneratedRecipe } from 'server/api/routers/recipe/interface'
import { api } from 'utils/api'
import { z } from 'zod'

export const useGeneratedRecipe = () => {
  const {
    register,
    handleSubmit,
    formState: { isDirty, isValid },
    setValue,
    clearErrors,
    reset
  } = useForm<GenerateRecipeParams>({
    resolver: zodResolver(generateRecipeFormSchema)
  })
  const utils = api.useContext()
  utils.recipe.entity.prefetch()

  const [isGenRecipeOpen, setIsGenRecipeOpen] = useState(false)
  const [enableCloseModal, setEnableCloseModal] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])

  const genRecipe = api.recipe.generate.useMutation()

  const handleCloseModal = () => {
    setIsGenRecipeOpen(false)
  }

  const handleFillMessage = (e: MouseEvent<HTMLButtonElement>) => {
    setValue('message', e.currentTarget.innerText.toLowerCase(), {
      shouldValidate: true,
      shouldDirty: true
    })
    clearErrors()
  }

  const handleEnableCloseModal = () => {
    setEnableCloseModal(true)
  }

  const handleAddMessage = (values: GenerateRecipeParams) => {
    setMessages((state) => [
      ...state,
      { from: 'me', timeStamp: new Date().toISOString(), value: values.message }
    ])
    reset()

    setTimeout(() => {
      setMessages((state) => [
        ...state,
        {
          from: 'chat',
          timeStamp: new Date().toISOString(),
          value: 'Generating your recipe...'
        }
      ])
    }, 500)
  }

  const onSubmit = async (values: GenerateRecipeParams) => {
    setIsGenRecipeOpen(true)
    genRecipe.mutate(values)
  }

  return {
    enableCloseModal,
    genRecipe,
    isDirty,
    isGenRecipeOpen,
    isValid,
    messages,
    handleAddMessage,
    handleCloseModal,
    handleEnableCloseModal,
    handleFillMessage,
    onSubmit,
    handleSubmit,
    register
  }
}

const generateRecipeFormSchema = z.object({ message: z.string().min(6) })
export type GenerateRecipeParams = z.infer<typeof generateRecipeFormSchema>

type Message = {
  from: 'me' | 'chat'
  value: string
  timeStamp: string
}

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
      ingredients: ingredients.join('\n'),
      instructions: instructions.join('\n'),
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

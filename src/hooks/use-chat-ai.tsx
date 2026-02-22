import { useSession } from 'next-auth/react'
import { api } from '~/trpc/react'
import { useChatStore } from '~/stores/chat-store'
import { cuid } from '~/lib/createId'
import { useEffect } from 'react'
import type {
  Generated,
  generatedMessageSchema,
  MessageWithRecipes,
  MessageWithRecipesDTO,
  UpsertChatSchema
} from '~/schemas/chats-schema'
import { type Experimental_UseObjectHelpers as UseObjectHelpers } from '@ai-sdk/react'
import { toast } from '~/components/toast'
import { useFiltersByUserId } from './use-filters-by-user-id'
import { slugify } from '~/lib/utils'
import { getIngredientDisplayText } from '~/lib/ingredient-display'

type Object = UseObjectHelpers<typeof generatedMessageSchema, string>['object']
type Error = UseObjectHelpers<typeof generatedMessageSchema, string>['error']
type OnFinish = { object: Object; error: Error }

/**
 * Transforms database message data to the format expected by useChatStore
 */
const transformMessagesToChatStore = (data: MessageWithRecipesDTO[]) => {
  console.log('data', data)
  return data.map((message) => ({
    id: message.id,
    content: message.content,
    role: message.role,
    chatId: message.chatId,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
    recipes:
      message.recipes?.map((r) => ({
        id: r.recipe.id,
        name: r.recipe.name,
        description: r.recipe.description ?? null,
        prepMinutes: r.recipe.prepMinutes ?? null,
        cookMinutes: r.recipe.cookMinutes ?? null,
        cuisine: r.recipe.cuisine ?? null,
        course: r.recipe.course ?? null,
        dietTags: r.recipe.dietTags?.map((t) => t ?? '') ?? [],
        flavorTags: r.recipe.flavorTags?.map((t) => t ?? '') ?? [],
        mainIngredients: r.recipe.mainIngredients?.map((i) => i ?? '') ?? [],
        techniques: r.recipe.techniques?.map((t) => t ?? '') ?? [],
        slug: r.recipe.slug ?? '',
        ingredients:
          r.recipe.ingredients?.map((ingredient) => getIngredientDisplayText(ingredient)) ?? [],
        instructions:
          r.recipe.instructions?.map(
            (instruction) => instruction.description
          ) ?? [],
        saved: r.recipe.saved ?? false
      })) ?? []
  }))
}

export const useChatAI = () => {
  const { chatId, setChatId } = useChatStore()
  const { status: authStatus } = useSession()
  const isAuthenticated = authStatus === 'authenticated'
  const filters = useFiltersByUserId()
  const filtersData = filters.data
  const utils = api.useUtils()

  const { addMessage, setMessages, setStream } = useChatStore()

  const filterStrings: string[] = []
  if (filtersData) {
    filtersData.forEach((filter) => {
      if (filter.checked) filterStrings.push(filter.name)
    })
  }

  const { mutate: upsertChat } = api.chats.upsert.useMutation({
    async onSuccess(data) {
      if (data.chatId) {
        setChatId(data.chatId)
      } else {
        const chatId = useChatStore.getState().chatId
        utils.chats.getMessagesById.invalidate({ chatId })
      }
    },
    onError: (error) => {
      const stack = error.data?.stack
      if (stack) {
        toast.error(stack)
      } else {
        toast.error(error.message)
      }
    }
  })

  const handleUpsertChat = () => {
    if (!isAuthenticated) {
      return
    }
    const lastTwoMessages = useChatStore.getState().messages?.slice(-2) ?? []

    if (lastTwoMessages.length < 2) {
      return
    }

    const messages: UpsertChatSchema['messages'] = lastTwoMessages.map((m) => ({
      id: m.id,
      content: m.content,
      role: m.role,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
      recipes: m.recipes.map((r) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        description: r.description ?? '',
        ingredients: r.ingredients,
        instructions: r.instructions,
        prepMinutes: r.prepMinutes,
        cookMinutes: r.cookMinutes,
        cuisine: r.cuisine,
        course: r.course,
        dietTags: r.dietTags,
        flavorTags: r.flavorTags,
        mainIngredients: r.mainIngredients,
        techniques: r.techniques
      }))
    }))

    upsertChat({
      chatId: useChatStore.getState().chatId,
      messages
    })
  }

  const enabled = isAuthenticated && !!chatId

  const {
    status: queryStatus,
    data,
    error
  } = api.chats.getMessagesById.useQuery(
    { chatId: chatId ?? '' },
    {
      enabled,
      staleTime: Infinity
    }
  )

  // Create user message and add to store
  const createUserMessage = (message: MessageWithRecipes) => {
    addMessage(message)
  }

  // Handle AI response completion
  const handleAIResponse = (aiResponse: OnFinish) => {
    if (aiResponse.error?.stack) {
      toast.error(aiResponse.error?.stack)
      return
    }
    if (aiResponse?.object?.content) {
      // Don't create a new generated recipe if the recipe already exists
      const { messages, chatId } = useChatStore.getState()
      const messagesWithRecipes = messages?.flatMap((m) => m.recipes)
      const recipeNameToId = new Map<string, string>()
      for (const recipe of messagesWithRecipes) {
        recipeNameToId.set(recipe.name, recipe.id)
      }
      const assistantMessage: MessageWithRecipes = {
        id: cuid(),
        content: aiResponse.object.content,
        role: 'assistant',
        createdAt: new Date(),
        updatedAt: new Date(),
        chatId: chatId ?? '',
        recipes: (aiResponse.object?.recipes ?? []).map((recipe) => ({
          id: recipeNameToId.get(recipe?.name ?? '') ?? cuid(),
          name: recipe?.name ?? '',
          slug: recipe?.name ? slugify(recipe.name) : cuid(),
          description: recipe?.description ?? '',
          ingredients: recipe?.ingredients?.map((i) => i ?? '') ?? [],
          instructions: recipe?.instructions?.map((i) => i ?? '') ?? [],
          prepMinutes: recipe?.prepMinutes ?? null,
          cookMinutes: recipe?.cookMinutes ?? null,
          course: recipe?.course ?? null,
          cuisine: recipe?.cuisine ?? null,
          dietTags: recipe?.dietTags?.map((t) => t ?? '') ?? [],
          flavorTags: recipe?.flavorTags?.map((t) => t ?? '') ?? [],
          mainIngredients: recipe?.mainIngredients?.map((i) => i ?? '') ?? [],
          techniques: recipe?.techniques?.map((t) => t ?? '') ?? [],
          saved: false
        }))
      }
      addMessage(assistantMessage)
    }
  }

  const { mutate: generated } = api.chats.generated.useMutation({
    onError: (error) => {
      const stack = error.data?.stack
      if (stack) {
        toast.error(stack)
      } else {
        toast.error(error.message)
      }
    },
    onSuccess: () => {
      utils.chats.getMessagesById.invalidate({ chatId: chatId ?? '' })
    }
  })

  // when user clicks recipe to generate, don't create a new recipe, just update the existing one
  const handleGenerated = () => {
    const messagesToAdd = useChatStore.getState().messages
    const promptMessage = messagesToAdd?.at(-2)
    const generatedMessage = messagesToAdd?.at(-1)
    const chatId = useChatStore.getState().chatId
    if (!generatedMessage || !chatId || !promptMessage) {
      return
    }
    const { id, ingredients, instructions, ...rest } =
      generatedMessage.recipes[0]

    const data: Generated = {
      generated: {
        id,
        ingredients,
        instructions,
        // if 0, set to null
        prepMinutes: rest.prepMinutes || null,
        cookMinutes: rest.cookMinutes || null,
        messageId: generatedMessage.id,
        content: generatedMessage.content,
        chatId
      },
      prompt: {
        content: promptMessage.content,
        id: promptMessage.id,
        createdAt: promptMessage.createdAt,
        updatedAt: promptMessage.updatedAt,
        role: promptMessage.role
      }
    }
    generated(data)
  }

  const onFinishMessage = (aiResponse: OnFinish) => {
    if (aiResponse.error?.stack) {
      toast.error(aiResponse.error?.stack)
      return
    }
    const messages = useChatStore.getState().messages
    const recipes = messages.flatMap((m) => m.recipes)
    const userOrAppMessage = messages.at(-1)
    const assistantMessage = useChatStore.getState().stream
    const foundRecipe = recipes.find(
      (r) => r.name === assistantMessage?.recipes?.[0]?.name
    )
    if (!userOrAppMessage || !assistantMessage) return

    handleAIResponse(aiResponse)
    // path when user clicks generate recipe, updates the existing recipe on clicked message
    if (foundRecipe) {
      handleGenerated()
    } else {
      handleUpsertChat()
    }
    setStream(null)
  }

  useEffect(() => {
    if (queryStatus === 'success' && data) {
      setMessages(transformMessagesToChatStore(data.messages))
    }
  }, [queryStatus, data, setMessages])

  useEffect(() => {
    if (error && queryStatus === 'error') {
      const stack = error.data?.stack
      if (stack) {
        toast.error(stack)
      } else {
        toast.error(error.message)
      }
    }
  }, [queryStatus, error])

  return {
    // Actions
    createUserMessage,
    onFinishMessage
  }
}

import { useSession } from 'next-auth/react'
import { api } from '~/trpc/react'
import { useChatStore } from '~/components/chat/chat-store'
import { useChatDrawerStore } from '~/components/chat/chat-drawer-store'
import { cuid } from '~/lib/createId'
import { useEffect } from 'react'
import type {
  MessageWithRecipes,
  MessageWithRecipesDTO,
  UpsertChatSchema
} from '~/schemas/chats-schema'
import { toast } from '~/components/toast'
import { useTranslations } from '~/hooks/use-translations'
import {
  useFiltersByUserId,
  selectActiveFilters
} from './use-filters-by-user-id'
import { useUserId } from './use-user-id'
import { slugify } from '~/lib/utils'
import { getIngredientDisplayText } from '~/lib/ingredient-display'
import type { GeneratedRecipe, RecipeDetails } from '~/schemas/messages-schema'

/**
 * Transforms database message data to the format expected by useChatStore
 */
const transformMessagesToChatStore = (data: MessageWithRecipesDTO[]) => {
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
        servings: r.recipe.servings ?? null,
        cuisine: r.recipe.cuisine ?? null,
        course: r.recipe.course ?? null,
        dietTags: r.recipe.dietTags?.map((t) => t ?? '') ?? [],
        flavorTags: r.recipe.flavorTags?.map((t) => t ?? '') ?? [],
        mainIngredients: r.recipe.mainIngredients?.map((i) => i ?? '') ?? [],
        techniques: r.recipe.techniques?.map((t) => t ?? '') ?? [],
        slug: r.recipe.slug ?? '',
        ingredients:
          r.recipe.ingredients?.map((ingredient) =>
            getIngredientDisplayText(ingredient)
          ) ?? [],
        instructions:
          r.recipe.instructions?.map(
            (instruction) => instruction.description
          ) ?? [],
        saved: r.recipe.saved ?? false
      })) ?? []
  }))
}

export const useChatAI = () => {
  const t = useTranslations()
  const { chatId, setChatId, setChatFilterIds, setUsePantry } = useChatStore()
  const { status: authStatus } = useSession()
  const isAuthenticated = authStatus === 'authenticated'
  const filters = useFiltersByUserId()
  const filtersData = filters.data
  const utils = api.useUtils()
  const userId = useUserId()

  const { addMessage, setMessages, setPendingExpandRecipeId } = useChatStore()

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
      recipes: m.recipes
        .filter(
          (r) =>
            r.name.trim().length > 0 && (r.description ?? '').trim().length > 0
        )
        .map((r) => ({
          id: r.id,
          name: r.name,
          slug: r.slug,
          description: r.description ?? '',
          servings: r.servings ?? null,
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

    // If after filtering nothing meaningful remains in the assistant message,
    // skip the save — there's nothing useful to persist.
    const assistantHasContent = messages.some(
      (m) =>
        m.role === 'assistant' && (m.recipes.length > 0 || m.content.length > 0)
    )
    if (!assistantHasContent) {
      return
    }

    const currentChatId = useChatStore.getState().chatId
    const filterIds = !currentChatId
      ? selectActiveFilters(
          utils.filters.getByUserId.getData({ userId }) ?? []
        ).map((f) => f.id)
      : undefined

    upsertChat({
      chatId: currentChatId || undefined,
      messages,
      filterIds,
      context: useChatDrawerStore.getState().context
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

  /** Create a user message and add it to the store. */
  const createUserMessage = (message: MessageWithRecipes) => {
    addMessage(message)
  }

  /** Handle AI response completion. */
  const handleAIResponse = (
    content: string,
    recipes: (GeneratedRecipe & Partial<RecipeDetails>)[],
    toolInvocations?: Array<{ toolName: string; result?: unknown }>
  ) => {
    const { messages, chatId } = useChatStore.getState()
    // Exclude the last assistant message (the streaming one being updated) so that
    // suggestion card IDs take precedence — those are the IDs persisted to the DB.
    const lastMessage = messages.at(-1)
    const messagesToScan =
      lastMessage?.role === 'assistant' ? messages.slice(0, -1) : messages
    const recipeNameToId = new Map<string, string>()
    for (const recipe of messagesToScan.flatMap((m) => m.recipes)) {
      recipeNameToId.set(recipe.name, recipe.id)
    }

    // Check if this assistant message was already added during streaming
    if (lastMessage?.role === 'assistant') {
      // Update the existing message with final data
      const updatedMessage: MessageWithRecipes = {
        ...lastMessage,
        content,
        recipes: recipes.map((recipe) => ({
          id: recipeNameToId.get(recipe?.name ?? '') ?? cuid(),
          name: recipe?.name ?? '',
          slug: recipe?.name ? slugify(recipe.name) : cuid(),
          description: recipe?.description ?? '',
          ingredients: recipe?.ingredients?.map((i) => i ?? '') ?? [],
          instructions: recipe?.instructions?.map((i) => i ?? '') ?? [],
          prepMinutes: recipe?.prepMinutes ?? null,
          cookMinutes: recipe?.cookMinutes ?? null,
          servings: recipe?.servings ?? null,
          course: recipe?.course ?? null,
          cuisine: recipe?.cuisine ?? null,
          dietTags: recipe?.dietTags?.map((t) => t ?? '') ?? [],
          flavorTags: recipe?.flavorTags?.map((t) => t ?? '') ?? [],
          mainIngredients: recipe?.mainIngredients?.map((i) => i ?? '') ?? [],
          techniques: recipe?.techniques?.map((t) => t ?? '') ?? [],
          saved: false
        })),
        toolInvocations:
          toolInvocations as MessageWithRecipes['toolInvocations']
      }
      const updated = [...messages]
      updated[updated.length - 1] = updatedMessage
      useChatStore.setState({ messages: updated })
      return
    }

    const assistantMessage: MessageWithRecipes = {
      id: cuid(),
      content,
      role: 'assistant',
      createdAt: new Date(),
      updatedAt: new Date(),
      chatId: chatId ?? '',
      recipes: recipes.map((recipe) => ({
        id: recipeNameToId.get(recipe?.name ?? '') ?? cuid(),
        name: recipe?.name ?? '',
        slug: recipe?.name ? slugify(recipe.name) : cuid(),
        description: recipe?.description ?? '',
        ingredients: recipe?.ingredients?.map((i) => i ?? '') ?? [],
        instructions: recipe?.instructions?.map((i) => i ?? '') ?? [],
        prepMinutes: recipe?.prepMinutes ?? null,
        cookMinutes: recipe?.cookMinutes ?? null,
        servings: recipe?.servings ?? null,
        course: recipe?.course ?? null,
        cuisine: recipe?.cuisine ?? null,
        dietTags: recipe?.dietTags?.map((t) => t ?? '') ?? [],
        flavorTags: recipe?.flavorTags?.map((t) => t ?? '') ?? [],
        mainIngredients: recipe?.mainIngredients?.map((i) => i ?? '') ?? [],
        techniques: recipe?.techniques?.map((t) => t ?? '') ?? [],
        saved: false
      })),
      toolInvocations: toolInvocations as MessageWithRecipes['toolInvocations']
    }
    addMessage(assistantMessage)
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
    onSuccess: (data) => {
      // The server may have swapped to a new chat (stale-swap) — adopt whatever
      // effective chatId it returns rather than trusting the pre-minted cuid.
      if (data.chatId) {
        setChatId(data.chatId)
      }
      utils.chats.getMessagesById.invalidate({
        chatId: data.chatId ?? chatId ?? ''
      })
    }
  })

  // when user clicks recipe to generate, don't create a new recipe, just update the existing one
  const handleGenerated = (recipeId: string) => {
    const messagesToAdd = useChatStore.getState().messages
    const promptMessage = messagesToAdd?.at(-2)
    const generatedMessage = messagesToAdd?.at(-1)
    if (!generatedMessage || !promptMessage) {
      return
    }
    let chatId = useChatStore.getState().chatId
    if (!chatId) {
      chatId = cuid()
      setChatId(chatId)
    }
    const { name, ingredients, instructions, ...rest } =
      generatedMessage.recipes[0]

    // Don't persist a recipe the model failed to fully generate — an empty
    // ingredients/instructions list means expandRecipe didn't produce details.
    if (ingredients.length === 0 || instructions.length === 0) {
      toast.error(t.chat.generationIncomplete)
      return
    }

    const data = {
      generated: {
        id: recipeId,
        name,
        ingredients,
        instructions,
        // if 0, set to null
        prepMinutes: rest.prepMinutes || null,
        cookMinutes: rest.cookMinutes || null,
        servings: rest.servings ?? null,
        cuisine: rest.cuisine,
        course: rest.course,
        dietTags: rest.dietTags,
        flavorTags: rest.flavorTags,
        mainIngredients: rest.mainIngredients,
        techniques: rest.techniques,
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
      },
      context: useChatDrawerStore.getState().context
    }
    generated(data)
  }

  const onFinishMessage = (
    content: string,
    recipes: (GeneratedRecipe & Partial<RecipeDetails>)[],
    toolInvocations?: Array<{ toolName: string; result?: unknown }>
  ) => {
    // A "Generate" click forces the expandRecipe tool. When the model returns
    // incomplete details (or a name that matches no prior suggestion),
    // extraction yields no recipe. Drop the dead attempt instead of adding and
    // persisting a recipe-less assistant bubble — revert the trailing
    // user-prompt + assistant placeholder so the suggestion card stays
    // available to retry, and tell the user why nothing rendered.
    const isExpand = toolInvocations?.some((t) => t.toolName === 'expandRecipe')
    if (isExpand && recipes.length === 0) {
      const current = useChatStore.getState().messages
      let end = current.length
      if (current[end - 1]?.role === 'assistant') end--
      if (current[end - 1]?.role === 'user') end--
      useChatStore.setState({ messages: current.slice(0, end) })
      setPendingExpandRecipeId(null)
      toast.error(t.chat.generationIncomplete)
      return
    }

    // editRecipe/addNote write straight to Prisma from the server-side tool
    // execute, bypassing the api.recipes.edit mutation (and its onSuccess
    // invalidate) that the in-page edit form relies on. Invalidate here so the
    // recipe-detail view picks up the change instead of showing stale data.
    const recipeMutated = toolInvocations?.some(
      (t) =>
        (t.toolName === 'editRecipe' || t.toolName === 'addNote') &&
        (t.result as { success?: boolean } | undefined)?.success
    )
    if (recipeMutated) {
      utils.recipes.invalidate()
    }

    const messages = useChatStore.getState().messages
    const lastMessage = messages.at(-1)
    const messagesToScan =
      lastMessage?.role === 'assistant' ? messages.slice(0, -1) : messages
    const existingRecipes = messagesToScan.flatMap((m) => m.recipes)
    const foundRecipe = existingRecipes.find(
      (r) => r.name === recipes?.[0]?.name
    )

    handleAIResponse(content, recipes, toolInvocations)

    // path when user clicks generate recipe, updates the existing recipe on clicked message
    if (foundRecipe) {
      handleGenerated(foundRecipe.id)
    } else {
      handleUpsertChat()
    }
  }

  // Reset per-chat state when switching chats so it doesn't bleed across
  // contexts/chats. chatFilterIds is reloaded from server data below; usePantry
  // isn't persisted, so it simply clears to false on every switch.
  useEffect(() => {
    setChatFilterIds(null)
    setUsePantry(false)
  }, [chatId, setChatFilterIds, setUsePantry])

  useEffect(() => {
    if (queryStatus === 'success' && data) {
      setMessages(transformMessagesToChatStore(data.messages))
      setChatFilterIds(data.filterIds ?? [])
    }
  }, [queryStatus, data, setMessages, setChatFilterIds])

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

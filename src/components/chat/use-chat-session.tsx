'use client'

import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { useChat } from '@ai-sdk/react'
import { useSession } from 'next-auth/react'
import { api } from '~/trpc/react'
import { useChatStore } from './chat-store'
import { useChatDrawerStore } from './chat-drawer-store'
import { useUserId } from '~/hooks/use-user-id'
import {
  useFiltersByUserId,
  selectActiveFilters
} from '~/hooks/use-filters-by-user-id'
import { useTranslations } from '~/hooks/use-translations'
import { toast } from '~/components/toast'
import { cuid } from '~/lib/createId'
import { userMessageDTO } from '~/lib/user-message-dto'
import { buildGenerateRecipeContent } from '~/lib/build-generate-recipe-content'
import { STREAM_TIMEOUT } from '~/constants/chat'
import { transformStoredMessages } from './recipe-dto'
import { extractFromToolInvocations } from './extract-tool-invocations'
import {
  buildUpsertMessages,
  didMutateRecipe,
  findExpandedRecipeId,
  isFailedExpand,
  priorRecipes,
  reconcileAssistantMessage,
  rollbackExpand,
  turnHasContentToPersist
} from './chat-turn'
import type {
  MessageWithRecipes,
  UpsertChatSchema
} from '~/schemas/chats-schema'
import type { GeneratedRecipe, RecipeDetails } from '~/schemas/messages-schema'

/**
 * The one interface every chat-screen component talks to. Reading state and
 * driving a whole turn (send, expand, stop) goes through here; transport wiring,
 * stream reconciliation, rollback, the timeout watchdog, and persistence are
 * implementation owned by {@link useChatSession}.
 */
export type ChatSession = {
  messages: MessageWithRecipes[]
  isStreaming: boolean
  /** Send a user Message and stream the assistant's reply. */
  sendMessage: (content: string) => void
  /** Expand a Recipe Option card into a full Recipe, keeping the card's id. */
  generateRecipe: (recipeId: string, name: string, description: string) => void
  /** Stop the in-flight stream. */
  stop: () => void
}

/**
 * The deep Chat session: owns one Chat turn end to end — transport wiring,
 * streaming reconciliation, Recipe Option expansion and its failure rollback,
 * the single stream-timeout watchdog, and persistence — and exposes the small
 * {@link ChatSession} interface its callers share.
 *
 * @param options.fetch - Injectable transport. Production omits it (real ai-sdk
 * fetch); tests substitute a fake to drive a whole turn without the network.
 */
export function useChatSession(options?: {
  fetch?: typeof globalThis.fetch
}): ChatSession {
  const t = useTranslations()
  const { status: authStatus } = useSession()
  const isAuthenticated = authStatus === 'authenticated'
  const userId = useUserId()
  const utils = api.useUtils()
  useFiltersByUserId()

  const messages = useChatStore((s) => s.messages)
  const isStreaming = useChatStore((s) => s.isStreaming)
  const chatId = useChatStore((s) => s.chatId)
  const {
    setInput,
    setMessages,
    addMessage,
    setChatId,
    setChatFilterIds,
    setIsStreaming,
    setPendingExpandRecipeId
  } = useChatStore()

  const { mutate: upsertChat } = api.chats.upsert.useMutation({
    async onSuccess(data) {
      if (data.chatId) {
        setChatId(data.chatId)
      } else {
        utils.chats.getMessagesById.invalidate({
          chatId: useChatStore.getState().chatId
        })
      }
    },
    onError: (error) => toast.error(error.data?.stack ?? error.message)
  })

  const { mutate: recordGenerated } = api.chats.generated.useMutation({
    onError: (error) => toast.error(error.data?.stack ?? error.message),
    onSuccess: () => {
      utils.chats.getMessagesById.invalidate({
        chatId: useChatStore.getState().chatId
      })
    }
  })

  /** Persist a turn that proposed new Recipe Options (Chat upsert). */
  const persistUpsert = (turn: MessageWithRecipes[]) => {
    if (!isAuthenticated) return
    const lastTwo = turn.slice(-2)
    if (lastTwo.length < 2) return

    const upsertMessages: UpsertChatSchema['messages'] =
      buildUpsertMessages(lastTwo)
    if (!turnHasContentToPersist(upsertMessages)) return

    const currentChatId = useChatStore.getState().chatId
    const filterIds = !currentChatId
      ? selectActiveFilters(
          utils.filters.getByUserId.getData({ userId }) ?? []
        ).map((f) => f.id)
      : undefined

    upsertChat({
      chatId: currentChatId || undefined,
      messages: upsertMessages,
      filterIds
    })
  }

  /** Record a Recipe expanded from a Recipe Option onto its existing card. */
  const persistGenerated = (turn: MessageWithRecipes[], recipeId: string) => {
    const promptMessage = turn.at(-2)
    const generatedMessage = turn.at(-1)
    if (!generatedMessage || !promptMessage) return

    let currentChatId = useChatStore.getState().chatId
    if (!currentChatId) {
      currentChatId = cuid()
      setChatId(currentChatId)
    }

    const { name, ingredients, instructions, ...rest } =
      generatedMessage.recipes[0]

    // Don't persist a recipe the model failed to fully generate — an empty
    // ingredients/instructions list means expandRecipe didn't produce details.
    if (ingredients.length === 0 || instructions.length === 0) {
      toast.error(t.chat.generationIncomplete)
      return
    }

    recordGenerated({
      generated: {
        id: recipeId,
        name,
        ingredients,
        instructions,
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
        chatId: currentChatId
      },
      prompt: {
        content: promptMessage.content,
        id: promptMessage.id,
        createdAt: promptMessage.createdAt,
        updatedAt: promptMessage.updatedAt,
        role: promptMessage.role
      }
    })
  }

  /**
   * Reconcile a finished turn into state and persist it: roll back a dead
   * expand, otherwise write the assistant reply and record it (expanded Recipe)
   * or upsert the Chat (new Recipe Options).
   */
  const finishTurn = (
    content: string,
    recipes: (GeneratedRecipe & Partial<RecipeDetails>)[],
    toolInvocations: MessageWithRecipes['toolInvocations'],
    clearPendingExpandId: boolean
  ) => {
    const current = useChatStore.getState().messages

    if (isFailedExpand(toolInvocations, recipes)) {
      setMessages(rollbackExpand(current))
      setPendingExpandRecipeId(null)
      toast.error(t.chat.generationIncomplete)
      return
    }

    if (clearPendingExpandId) setPendingExpandRecipeId(null)

    // editRecipe/addNote write straight to Prisma from the server-side tool
    // execute, bypassing the api.recipes.edit mutation's onSuccess invalidate.
    // Invalidate here so the recipe-detail view picks up the change.
    if (didMutateRecipe(toolInvocations)) utils.recipes.invalidate()

    const expandedId = findExpandedRecipeId(current, recipes?.[0]?.name)
    const reconciled = reconcileAssistantMessage(current, {
      content,
      recipes,
      toolInvocations,
      chatId: useChatStore.getState().chatId
    })
    setMessages(reconciled)

    if (expandedId) {
      persistGenerated(reconciled, expandedId)
    } else {
      persistUpsert(reconciled)
    }
  }

  const {
    messages: transportMessages,
    append,
    stop: transportStop,
    status,
    setMessages: setTransportMessages
  } = useChat({
    api: '/api/chat',
    id: 'recipe-chat',
    fetch: options?.fetch,
    // Single client step. The client never feeds a tool result back to the
    // model — it renders the result itself (generateRecipeOptions cards, the
    // expandRecipe merge). With a server-side execute on generateRecipeOptions
    // the response now carries a tool result + finishReason 'tool-calls'; any
    // maxSteps > 1 makes useChat auto-submit a continuation, looping /api/chat
    // and leaving isStreaming stuck true (disabled Generate buttons). The server
    // route does its own multi-step work (editRecipe confirmation) internally.
    maxSteps: 1,
    experimental_prepareRequestBody({ messages }) {
      const filters = utils.filters.getByUserId.getData({ userId })
      const chatFilterIds = useChatStore.getState().chatFilterIds
      const context = useChatDrawerStore.getState().context
      const usePantry = useChatStore.getState().usePantry
      const activeFilterNames =
        chatFilterIds !== null
          ? (filters ?? [])
              .filter((f) => chatFilterIds.includes(f.id))
              .map((f) => f.name)
          : selectActiveFilters(filters ?? []).map((f) => f.name)
      return {
        messages: messages
          .filter((m) => m.content.length > 0)
          .map((m) => ({ content: m.content, role: m.role, id: m.id })),
        filters: activeFilterNames,
        userId: userId || undefined,
        context,
        usePantry,
        expand: useChatStore.getState().pendingExpandRecipeId !== null
      }
    },
    onError(error) {
      toast.error(error.message)
      setIsStreaming(false)
    },
    onFinish(message) {
      setIsStreaming(false)
      const current = useChatStore.getState().messages
      const { recipes, toolMessage, clearPendingExpandId } =
        extractFromToolInvocations(
          message.toolInvocations as
            | Array<{
                toolName: string
                args?: Record<string, unknown>
                result?: unknown
              }>
            | undefined,
          {
            priorRecipes: priorRecipes(current),
            pendingExpandRecipeId: useChatStore.getState().pendingExpandRecipeId
          }
        )
      finishTurn(
        message.content || toolMessage,
        recipes,
        message.toolInvocations as MessageWithRecipes['toolInvocations'],
        clearPendingExpandId
      )
    }
  })

  // Mirror transport status into the store's streaming flag.
  useEffect(() => {
    setIsStreaming(status === 'streaming' || status === 'submitted')
  }, [status, setIsStreaming])

  // Reconcile the in-flight assistant message into the store as it streams.
  useEffect(() => {
    if (status !== 'streaming' || transportMessages.length === 0) return
    const lastMsg = transportMessages[transportMessages.length - 1]
    if (lastMsg.role !== 'assistant') return

    const current = useChatStore.getState().messages
    const { recipes, toolMessage } = extractFromToolInvocations(
      lastMsg.toolInvocations as
        | Array<{
            toolName: string
            args?: Record<string, unknown>
            result?: unknown
          }>
        | undefined,
      {
        priorRecipes: priorRecipes(current),
        pendingExpandRecipeId: useChatStore.getState().pendingExpandRecipeId
      }
    )
    setMessages(
      reconcileAssistantMessage(current, {
        content: lastMsg.content || toolMessage,
        recipes,
        toolInvocations:
          lastMsg.toolInvocations as MessageWithRecipes['toolInvocations'],
        chatId: useChatStore.getState().chatId
      })
    )
  }, [status, transportMessages, setMessages])

  // The single stream-timeout watchdog. Both entry points set the streaming
  // flag, so one watchdog here covers every turn: if a stream never finishes,
  // stop it, clear the spinner, and drop any pending expand so the card retries.
  useEffect(() => {
    if (!isStreaming) return
    const timeout = setTimeout(() => {
      transportStop()
      setIsStreaming(false)
      setPendingExpandRecipeId(null)
    }, STREAM_TIMEOUT)
    return () => clearTimeout(timeout)
  }, [isStreaming, transportStop, setIsStreaming, setPendingExpandRecipeId])

  // Load an existing Chat's Messages when resuming one.
  const enabled = isAuthenticated && !!chatId
  const {
    status: queryStatus,
    data,
    error
  } = api.chats.getMessagesById.useQuery(
    { chatId: chatId ?? '' },
    { enabled, staleTime: Infinity }
  )

  useEffect(() => {
    setChatFilterIds(null)
  }, [chatId, setChatFilterIds])

  useEffect(() => {
    if (queryStatus === 'success' && data) {
      setMessages(transformStoredMessages(data.messages))
      setChatFilterIds(data.filterIds ?? [])
    }
  }, [queryStatus, data, setMessages, setChatFilterIds])

  useEffect(() => {
    if (error && queryStatus === 'error') {
      toast.error(error.data?.stack ?? error.message)
    }
  }, [queryStatus, error])

  /** Add the user Message, sync prior Messages into the transport, and stream. */
  const submit = (turn: MessageWithRecipes[]) => {
    const lastMessage = turn.at(-1)
    if (!lastMessage) return

    addMessage(lastMessage)
    setInput('')

    const prior = turn.slice(0, -1)
    setTransportMessages(
      prior.map((m) => ({
        id: m.id,
        content: m.content,
        role: m.role as 'user' | 'assistant' | 'system',
        createdAt: m.createdAt
      }))
    )

    append({
      id: lastMessage.id,
      content: lastMessage.content,
      role: 'user',
      createdAt: lastMessage.createdAt
    })
  }

  const sendMessage = (content: string) => {
    if (!content.trim()) return
    const currentChatId = useChatStore.getState().chatId
    submit([
      ...useChatStore.getState().messages,
      userMessageDTO(content, currentChatId)
    ])
  }

  const generateRecipe = (
    recipeId: string,
    name: string,
    description: string
  ) => {
    setIsStreaming(true)
    setPendingExpandRecipeId(recipeId)
    const currentChatId = useChatStore.getState().chatId
    submit([
      ...useChatStore.getState().messages,
      userMessageDTO(
        buildGenerateRecipeContent(t.chat.generateRecipe, name, description),
        currentChatId
      )
    ])
  }

  return {
    messages,
    isStreaming,
    sendMessage,
    generateRecipe,
    stop: transportStop
  }
}

const ChatSessionContext = createContext<ChatSession | null>(null)

/**
 * Provides one {@link ChatSession} instance to the chat screen so the message
 * form and the Recipe Option Generate button share it — the button reaches the
 * assistant whether or not the form is mounted.
 */
export function ChatSessionProvider({
  children,
  fetch
}: {
  children: ReactNode
  fetch?: typeof globalThis.fetch
}) {
  const session = useChatSession({ fetch })
  return (
    <ChatSessionContext.Provider value={session}>
      {children}
    </ChatSessionContext.Provider>
  )
}

export function useChatSessionContext() {
  const session = useContext(ChatSessionContext)
  if (!session) {
    throw new Error(
      'useChatSessionContext must be used within a ChatSessionProvider'
    )
  }
  return session
}

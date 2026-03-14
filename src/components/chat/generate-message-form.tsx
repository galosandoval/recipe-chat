'use client'

import { useTranslations } from '~/hooks/use-translations'
import { useChatStore } from '~/stores/chat-store'
import { useChat } from '@ai-sdk/react'
import type { MessageWithRecipes } from '~/schemas/chats-schema'
import { useChatAI } from '~/hooks/use-chat-ai'
import { useEffect, useRef } from 'react'
import { userMessageDTO } from '~/lib/user-message-dto'
import { useUserId } from '~/hooks/use-user-id'
import { api } from '~/trpc/react'
import { selectActiveFilters } from '~/hooks/use-filters-by-user-id'
import { useChatDrawerStore } from '~/stores/chat-drawer-store'
import { Button } from '~/components/button'
import { Input } from '~/components/ui/input'
import { BottomBar } from '~/components/bottom-bar'
import { toast } from '~/components/toast'
import { SendIcon, StopCircleIcon } from 'lucide-react'
import { cuid } from '~/lib/createId'
import { slugify } from '~/lib/utils'
import type { GeneratedRecipe } from '~/schemas/messages-schema'

function extractRecipesFromToolInvocations(
  toolInvocations: Array<{ toolName: string; args?: Record<string, unknown>; result?: unknown }> | undefined
): GeneratedRecipe[] {
  if (!toolInvocations) return []
  const generateCall = toolInvocations.find(
    (t) => t.toolName === 'generateRecipes' && 'args' in t
  )
  if (!generateCall?.args) return []
  const args = generateCall.args as { recipes?: GeneratedRecipe[] }
  return args.recipes ?? []
}

function useRecipeChat() {
  const userId = useUserId()
  const { setInput, setIsStreaming, addMessage } = useChatStore()
  const { onFinishMessage, createUserMessage } = useChatAI()
  const utils = api.useUtils()

  const {
    messages: chatMessages,
    append,
    stop: aiStop,
    status,
    setMessages: setAiMessages
  } = useChat({
    api: '/api/chat',
    id: 'recipe-chat',
    maxSteps: 2,
    experimental_prepareRequestBody({ messages }) {
      const filters = utils.filters.getByUserId.getData({ userId })
      const context = useChatDrawerStore.getState().context
      return {
        messages: messages.map((m) => ({
          content: m.content,
          role: m.role,
          id: m.id
        })),
        filters: selectActiveFilters(filters ?? []).map((f) => f.name),
        userId: userId || undefined,
        context
      }
    },
    onError(error) {
      toast.error(error.message)
      setIsStreaming(false)
    },
    onFinish(message) {
      setIsStreaming(false)
      const recipes = extractRecipesFromToolInvocations(
        message.toolInvocations as Array<{ toolName: string; args?: Record<string, unknown>; result?: unknown }> | undefined
      )
      onFinishMessage(message.content, recipes, message.toolInvocations as Array<{ toolName: string; result?: unknown }> | undefined)
    }
  })

  // Sync streaming status
  useEffect(() => {
    const streaming = status === 'streaming' || status === 'submitted'
    setIsStreaming(streaming)
  }, [status, setIsStreaming])

  // Sync last streaming message to store for rendering
  useEffect(() => {
    if (status === 'streaming' && chatMessages.length > 0) {
      const lastMsg = chatMessages[chatMessages.length - 1]
      if (lastMsg.role === 'assistant') {
        const recipes = extractRecipesFromToolInvocations(
          lastMsg.toolInvocations as Array<{ toolName: string; args?: Record<string, unknown>; result?: unknown }> | undefined
        )
        const storeMessages = useChatStore.getState().messages
        const existingIdx = storeMessages.findIndex((m) => m.id === lastMsg.id)

        const messageWithRecipes: MessageWithRecipes = {
          id: lastMsg.id,
          content: lastMsg.content,
          role: 'assistant',
          chatId: useChatStore.getState().chatId,
          createdAt: lastMsg.createdAt ?? new Date(),
          updatedAt: new Date(),
          recipes: recipes.map((r) => ({
            id: cuid(),
            name: r.name ?? '',
            slug: r.name ? slugify(r.name) : cuid(),
            description: r.description ?? '',
            ingredients: r.ingredients?.map((i) => i ?? '') ?? [],
            instructions: r.instructions?.map((i) => i ?? '') ?? [],
            prepMinutes: r.prepMinutes ?? null,
            cookMinutes: r.cookMinutes ?? null,
            servings: r.servings ?? null,
            course: r.course ?? null,
            cuisine: r.cuisine ?? null,
            dietTags: r.dietTags?.map((t) => t ?? '') ?? [],
            flavorTags: r.flavorTags?.map((t) => t ?? '') ?? [],
            mainIngredients: r.mainIngredients?.map((i) => i ?? '') ?? [],
            techniques: r.techniques?.map((t) => t ?? '') ?? [],
            saved: false
          })),
          toolInvocations: lastMsg.toolInvocations as MessageWithRecipes['toolInvocations']
        }

        if (existingIdx >= 0) {
          const updated = [...storeMessages]
          updated[existingIdx] = messageWithRecipes
          useChatStore.setState({ messages: updated })
        } else {
          addMessage(messageWithRecipes)
        }
      }
    }
  }, [status, chatMessages, addMessage])

  const handleAISubmit = (messages: MessageWithRecipes[]) => {
    const lastMessage = messages.at(-1)
    if (!lastMessage) return

    createUserMessage(lastMessage)
    setInput('')

    // Sync prior messages (all except the last user message) into useChat
    const priorMessages = messages.slice(0, -1)
    setAiMessages(
      priorMessages.map((m) => ({
        id: m.id,
        content: m.content,
        role: m.role as 'user' | 'assistant' | 'system',
        createdAt: m.createdAt
      }))
    )

    // Append the new user message — this triggers the API call
    append({
      id: lastMessage.id,
      content: lastMessage.content,
      role: 'user',
      createdAt: lastMessage.createdAt
    })
  }

  return {
    handleAISubmit,
    stop: aiStop
  }
}

const STREAM_TIMEOUT = 30000 // 30 seconds

export function GenerateMessageForm() {
  const { input, handleInputChange, messages, chatId, reset, isStreaming } =
    useChatStore()
  const { handleAISubmit, stop: aiStop } = useRecipeChat()
  const t = useTranslations()
  const streamTimeout = useRef<NodeJS.Timeout | null>(null)
  const handleAISubmitRef = useRef(handleAISubmit)

  // Keep the ref up-to-date with the latest handler
  useEffect(() => {
    handleAISubmitRef.current = handleAISubmit
  })

  // Set up a stable triggerAISubmission wrapper in the store (once)
  useEffect(() => {
    useChatStore.setState({
      triggerAISubmission: (messages: MessageWithRecipes[]) =>
        handleAISubmitRef.current(messages)
    })
  }, [])

  const enhancedHandleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const userMessage = userMessageDTO(input, chatId)

    const messagesToSubmit: MessageWithRecipes[] = [...messages, userMessage]

    if (isStreaming) {
      aiStop()
      if (streamTimeout.current) {
        clearTimeout(streamTimeout.current)
        streamTimeout.current = null
      }
    } else if (input.trim()) {
      handleAISubmit(messagesToSubmit)
      streamTimeout.current = setTimeout(() => {
        reset()
        streamTimeout.current = null
      }, STREAM_TIMEOUT)
    }
  }

  useEffect(() => {
    return () => {
      if (streamTimeout.current) {
        clearTimeout(streamTimeout.current)
        streamTimeout.current = null
      }
    }
  }, [])

  // Clear timeout when stream finishes
  useEffect(() => {
    if (!isStreaming && streamTimeout.current) {
      clearTimeout(streamTimeout.current)
      streamTimeout.current = null
    }
  }, [isStreaming])

  const context = useChatDrawerStore((s) => s.context)

  let placeholder = t.chat.chatFormPlaceholder
  if (messages.length > 0) {
    placeholder = t.chat.chatFormContinue
  } else if (context.page === 'recipe-detail') {
    placeholder = t.chat.replace('chatFormRecipeDetail', context.recipe.name)
  } else if (context.page === 'list') {
    placeholder = t.chat.chatFormList
  } else if (context.page === 'pantry') {
    placeholder = t.chat.chatFormPantry
  }

  return (
    <form onSubmit={enhancedHandleSubmit}>
      <BottomBar>
        <div className='flex w-full'>
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder={placeholder}
            className='bg-background/75 focus:bg-background w-full'
          />
        </div>

        <div>
          <Button
            type='submit'
            disabled={input.length < 5 && !isStreaming}
            variant={isStreaming ? 'destructive' : 'outline'}
          >
            {isStreaming ? <StopCircleIcon /> : <SendIcon />}
          </Button>
        </div>
      </BottomBar>
    </form>
  )
}

import { BotMessageSquareIcon, UserCircleIcon } from 'lucide-react'
import { cn } from '~/lib/utils'
import type { MessageWithRecipes } from '~/schemas/chats-schema'
import { CollapsableRecipe } from './collapsable-recipe'
import { RecipesToGenerate } from './recipes-to-generate'
import { memo, useMemo } from 'react'
import { useTranslations } from '~/hooks/use-translations'
import { api } from '~/trpc/react'
import { chatStore } from '~/stores/chat-store'
import { buildGenerateRecipeContent } from '~/lib/build-generate-recipe-content'
import { GenerateStatusAppMessage } from './app-message'

export const Message = function Message({
  message,
  isStreaming,
  isLastMessage
}: {
  message: MessageWithRecipes
  isStreaming: boolean
  isLastMessage: boolean
}) {
  if (message.role === 'assistant') {
    return <AssistantMessage message={message} isStreaming={isStreaming} />
  }

  return (
    <UserMessage
      message={message}
      isStreaming={isStreaming}
      isLastMessage={isLastMessage}
    />
  )
}

const UserMessage = memo(function UserMessage({
  message,
  isStreaming,
  isLastMessage
}: {
  message: MessageWithRecipes
  isStreaming: boolean
  isLastMessage: boolean
}) {
  const t = useTranslations()
  const utils = api.useUtils()
  const foundMessage = useMemo(() => {
    const chatId = chatStore.getState().chatId
    const data = utils.chats.getMessagesById.getData({ chatId: chatId ?? '' })
    const allRecipes =
      data?.messages.flatMap((m) => m.recipes)?.flatMap((r) => r.recipe) ?? []

    return allRecipes.find((r) =>
      message.content.includes(`${t.chatWindow.generateRecipe} ${r.name}`)
    )
  }, [message.content])
  if (foundMessage) {
    return (
      <GenerateStatusAppMessage
        recipeName={foundMessage.name}
        isStreaming={isStreaming && isLastMessage}
      />
    )
  }
  return (
    <div className='flex flex-col items-center self-end'>
      <div className='mx-auto w-full'>
        <ChatMessage
          content={message.content}
          icon={<UserCircleIcon />}
          isUserMessage
        />
      </div>
    </div>
  )
})

export function ChatMessage({
  icon,
  content,
  children,
  isUserMessage
}: {
  content: string
  icon: React.ReactNode
  children?: React.ReactNode
  isUserMessage?: boolean
}) {
  const iconEl = (
    <div key='icon'>
      <span className='relative grid size-8 place-items-center'>
        <span
          className={cn(
            'bg-secondary/20 absolute inset-0 size-8 rounded-full',
            isUserMessage && 'bg-primary/20'
          )}
        />
        <span className='grid size-6 place-items-center'>{icon}</span>
      </span>
    </div>
  )
  const bubbleEl = (
    <Bubble key='bubble' content={content} isUserMessage={isUserMessage}>
      {children}
    </Bubble>
  )
  let layout = [iconEl, bubbleEl]

  if (isUserMessage) {
    layout = layout.reverse()
  }

  return (
    <div
      className={cn(
        'flex w-full justify-start gap-2 self-center',
        isUserMessage && 'justify-end'
      )}
    >
      {layout}
    </div>
  )
}

function Bubble({
  content,
  isUserMessage,
  children
}: {
  content: string
  isUserMessage?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'bg-secondary flex w-4/5 flex-col rounded-md p-3 pb-4 sm:w-3/4',
        isUserMessage && 'bg-primary'
      )}
    >
      <p
        className={cn(
          'text-secondary-foreground text-sm whitespace-pre-line',
          isUserMessage && 'text-primary-foreground'
        )}
      >
        {content}
      </p>
      {children}
    </div>
  )
}

export function AssistantMessage({
  message,
  isStreaming
}: {
  message: MessageWithRecipes
  isStreaming: boolean
}) {
  return (
    <div className='flex flex-col items-center self-start'>
      <div className='mx-auto w-full'>
        <ChatMessage content={message.content} icon={<BotMessageSquareIcon />}>
          <>
            {message.recipes?.length === 1 && (
              <CollapsableRecipe
                isStreaming={isStreaming}
                recipe={message.recipes[0]}
              />
            )}
            {message.recipes && message.recipes?.length > 1 && (
              <RecipesToGenerate
                isStreaming={isStreaming}
                recipes={message.recipes}
              />
            )}
          </>
        </ChatMessage>
      </div>
    </div>
  )
}

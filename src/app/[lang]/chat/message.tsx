import { BotMessageSquareIcon, UserCircleIcon } from 'lucide-react'
import { cn } from '~/lib/utils'
import type { MessageWithRecipes } from '~/schemas/chats-schema'
import { CollapsableRecipe } from './collapsable-recipe'
import { RecipesToGenerate } from './recipes-to-generate'
import { memo, useMemo } from 'react'
import { useTranslations } from '~/hooks/use-translations'
import { api } from '~/trpc/react'
import { chatStore } from '~/stores/chat-store'
import { GenerateStatusAppMessage } from './app-message'
import { Avatar } from './avatar'

export const Message = function Message({
  message,
  isLastMessage
}: {
  message: MessageWithRecipes
  isLastMessage: boolean
}) {
  if (message.role === 'assistant') {
    return <AssistantMessage message={message} />
  }

  return <UserMessage message={message} isLastMessage={isLastMessage} />
}

const UserMessage = memo(function UserMessage({
  message,
  isLastMessage
}: {
  message: MessageWithRecipes
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
  const isStreaming = !!chatStore((state) => state.stream)

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
  let layout = [
    <Avatar key='avatar' isUserMessage={isUserMessage} icon={icon} />,
    <Bubble key='bubble' content={content} isUserMessage={isUserMessage}>
      {children}
    </Bubble>
  ]

  if (isUserMessage) {
    layout = layout.toReversed()
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

export function AssistantMessage({ message }: { message: MessageWithRecipes }) {
  return (
    <div className='flex flex-col items-center self-start'>
      <div className='mx-auto w-full'>
        <ChatMessage content={message.content} icon={<BotMessageSquareIcon />}>
          <>
            {message.recipes?.length === 1 && (
              <CollapsableRecipe recipe={message.recipes[0]} />
            )}
            {message.recipes && message.recipes?.length > 1 && (
              <RecipesToGenerate recipes={message.recipes} />
            )}
          </>
        </ChatMessage>
      </div>
    </div>
  )
}

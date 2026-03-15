import { BotMessageSquareIcon, UserCircleIcon } from 'lucide-react'
import { cn } from '~/lib/utils'
import type { MessageWithRecipes } from '~/schemas/chats-schema'
import { CollapsableRecipe } from './collapsable-recipe'
import { RecipesToGenerate } from './recipes-to-generate'
import { useTranslations } from '~/hooks/use-translations'
import { api } from '~/trpc/react'
import { useChatStore } from '~/stores/chat-store'
import { GenerateStatusAppMessage, ToolResultAppMessage } from './app-message'
import { Avatar } from './avatar'
import { AssistantMessageLoader } from '~/components/loaders/assistant-message'

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

function UserMessage({
  message,
  isLastMessage
}: {
  message: MessageWithRecipes
  isLastMessage: boolean
}) {
  const t = useTranslations()
  const utils = api.useUtils()
  const chatId = useChatStore((state) => state.chatId)
  const data = utils.chats.getMessagesById.getData({ chatId: chatId ?? '' })
  const allRecipes =
    data?.messages.flatMap((m) => m.recipes)?.flatMap((r) => r.recipe) ?? []

  const foundMessage = allRecipes.find((r) =>
    message.content.includes(`${t.chat.generateRecipe} ${r.name}`)
  )
  const isStreaming = useChatStore((state) => state.isStreaming)

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
}

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
  if (!message.content) {
    return <AssistantMessageLoader />
  }

  // Extract tool results for editRecipe/addNote
  const actionResults = message.toolInvocations?.filter(
    (t) => (t.toolName === 'editRecipe' || t.toolName === 'addNote') && t.result
  )

  return (
    <div className='flex flex-col items-center gap-2 self-start'>
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
      {actionResults?.map((t, i) => (
        <ToolResultAppMessage
          key={t.toolCallId ?? i}
          toolName={t.toolName}
          result={
            t.result as {
              success: boolean
              recipeName?: string
              error?: string
            }
          }
        />
      ))}
    </div>
  )
}

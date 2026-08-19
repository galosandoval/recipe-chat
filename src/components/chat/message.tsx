import { BotMessageSquareIcon, UserCircleIcon } from 'lucide-react'
import { cn } from '~/lib/utils'
import type { MessageWithRecipes } from '~/schemas/chats-schema'
import { CollapsableRecipe } from './collapsable-recipe'
import { RecipesToGenerate } from './recipes-to-generate'
import { useTranslations } from '~/hooks/use-translations'
import { useChatStore } from './chat-store'
import { GenerateStatusAppMessage, ToolResultAppMessage } from './app-message'
import { Avatar } from './avatar'
import { FadeIn } from '~/components/motion/fade-in'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'

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
  const storeMessages = useChatStore((state) => state.messages)
  const allRecipes = storeMessages.flatMap((m) => m.recipes)

  const foundMessage = allRecipes.find((r) =>
    message.content.includes(`${t.chat.generateRecipe} ${r.name}`)
  )
  const isStreaming = useChatStore((state) => state.isStreaming)

  if (foundMessage) {
    if (isStreaming && isLastMessage) return null
    return (
      <FadeIn>
        <GenerateStatusAppMessage
          recipeName={foundMessage.name}
          isStreaming={false}
        />
      </FadeIn>
    )
  }
  return (
    <FadeIn className='flex flex-col items-center self-end'>
      <div className='mx-auto w-full'>
        <ChatMessage
          content={message.content}
          icon={<UserCircleIcon />}
          isUserMessage
        />
      </div>
    </FadeIn>
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
        'flex justify-start gap-2 self-center',
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
        'bg-accent text-foreground flex flex-col rounded-md p-3 pb-4 text-sm sm:w-3/4',
        isUserMessage && 'bg-primary text-foreground'
      )}
    >
      {isUserMessage ? (
        <p className='whitespace-pre-line'>{content}</p>
      ) : (
        <MarkdownMessage content={content} />
      )}
      {children}
    </div>
  )
}

/**
 * Renders assistant chat content as markdown.
 *
 * The model often replies with headings, bold labels and nested lists; without
 * this the raw `**` / `-` markers leak into the bubble. Colors and base size
 * are inherited from the bubble, so only spacing and hierarchy are set here.
 */
function MarkdownMessage({ content }: { content: string }) {
  return (
    <div
      className={cn(
        'prose prose-sm max-w-none',
        // Bubbles are tight - collapse the plugin's generous block spacing.
        'prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5',
        'prose-headings:mt-3 prose-headings:mb-1',
        'prose-ul:pl-4 prose-ol:pl-4',
        'prose-p:first:mt-0 prose-p:last:mb-0',
        // Keep a readable hierarchy inside a small bubble; the plugin's default
        // scale is far too large here, but flattening every level to body size
        // makes h1/h2/h3 indistinguishable.
        'prose-h1:text-lg prose-h2:text-base prose-h3:text-sm',
        'prose-h1:font-semibold prose-h2:font-semibold prose-h3:font-medium',
        // The plugin hard-codes a light-mode gray scale onto `.prose` itself,
        // which beats the bubble's inherited color and leaves body text at
        // gray-700 on a dark bubble. Point its own variables at the inherited
        // color so both themes stay on the bubble's foreground token.
        '[--tw-prose-body:inherit] [--tw-prose-headings:inherit]',
        '[--tw-prose-bold:inherit] [--tw-prose-links:inherit]',
        '[--tw-prose-lead:inherit] [--tw-prose-quotes:inherit]',
        '[--tw-prose-captions:inherit] [--tw-prose-kbd:inherit]',
        '[--tw-prose-bullets:inherit] [--tw-prose-counters:inherit]',
        '[--tw-prose-code:inherit] [--tw-prose-pre-code:inherit]',
        // Borders take the var as a border-color, where `inherit` would pick up
        // the parent's border rather than the text color.
        '[--tw-prose-hr:currentColor] [--tw-prose-quote-borders:currentColor]',
        '[--tw-prose-td-borders:currentColor] [--tw-prose-th-borders:currentColor]',
        'prose-a:underline',
        'prose-code:bg-foreground/10 prose-code:rounded prose-code:px-1 prose-code:py-0.5',
        'prose-code:before:content-none prose-code:after:content-none',
        'prose-pre:bg-foreground/10'
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
        {stabilizePartialMarkdown(content)}
      </ReactMarkdown>
    </div>
  )
}

/** Emphasis pairs that visibly leak their raw markers while half-arrived. */
const DANGLING_MARKERS = ['**', '~~']

/**
 * Makes a partially-streamed markdown string safe to parse.
 *
 * Assistant bubbles re-parse on every token flush, so the document is almost
 * always incomplete: an unterminated ``` fence swallows the rest of the
 * bubble, and a half-arrived `**bold` shows its raw markers until the closer
 * lands. Closing the fence and dropping the unmatched marker keeps the bubble
 * stable as tokens arrive. A complete document has balanced markers, so this
 * is a no-op once the stream finishes.
 */
export function stabilizePartialMarkdown(content: string): string {
  const fences = content
    .split('\n')
    .filter((line) => line.trimStart().startsWith('```')).length

  if (fences % 2 === 1) return `${content}\n\`\`\``

  return DANGLING_MARKERS.reduce((stable, marker) => {
    const occurrences = stable.split(marker).length - 1
    if (occurrences % 2 === 0) return stable

    const last = stable.lastIndexOf(marker)
    return stable.slice(0, last) + stable.slice(last + marker.length)
  }, content)
}

export function AssistantMessage({ message }: { message: MessageWithRecipes }) {
  if (!message.content && !message.recipes?.length) {
    return null
  }

  // Extract tool results for editRecipe/addNote
  const actionResults = message.toolInvocations?.filter(
    (t) => (t.toolName === 'editRecipe' || t.toolName === 'addNote') && t.result
  )

  return (
    <FadeIn className='flex w-full flex-col items-center gap-2 self-start'>
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
    </FadeIn>
  )
}

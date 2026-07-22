'use client'

import { useTranslations } from '~/hooks/use-translations'
import { useChatStore } from './chat-store'
import { useChatSessionContext } from './use-chat-session'
import { useChatDrawerStore } from './chat-drawer-store'
import { Button } from '~/components/button'
import { Input } from '~/components/ui/input'
import { BottomBar } from '~/components/bottom-bar'
import { SendIcon, StopCircleIcon } from 'lucide-react'

export function GenerateMessageForm() {
  const t = useTranslations()
  const input = useChatStore((s) => s.input)
  const messages = useChatStore((s) => s.messages)
  const handleInputChange = useChatStore((s) => s.handleInputChange)
  const { isStreaming, sendMessage, stop } = useChatSessionContext()

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isStreaming) {
      stop()
    } else if (input.trim()) {
      sendMessage(input)
    }
  }

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
    <form onSubmit={handleSubmit}>
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

'use client'

import { MessageSquareIcon, PlusIcon, XIcon } from 'lucide-react'
import { Drawer as DrawerPrimitive } from 'vaul'
import { useChatDrawerStore } from '~/components/chat/chat-drawer-store'
import type { ChatContext } from '~/schemas/chats-schema'
import { useChatStore } from '~/components/chat/chat-store'
import { Interface } from '~/components/chat/interface'
import { BottomActiveFilters } from '~/components/chat/bottom-active-filters'
import { GenerateMessageForm } from '~/components/chat/generate-message-form'
import { ChatSessionProvider } from '~/components/chat/use-chat-session'
import { Button } from '~/components/button'
import { useRegisterFab } from '~/components/fab-stack/use-register-fab'

export function ChatPanel() {
  const { isOpen, close, context } = useChatDrawerStore()
  const messages = useChatStore((s) => s.messages)

  const headerLabel =
    context.page === 'recipe-detail' ? context.recipe.name : 'Chat'

  const handleStartNewChat = () => {
    const { setChatId, setIsStreaming, setMessages } = useChatStore.getState()
    setChatId('')
    setIsStreaming(false)
    setMessages([])
  }

  return (
    <DrawerPrimitive.Root
      direction='right'
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) close()
      }}
    >
      <DrawerPrimitive.Portal>
        <DrawerPrimitive.Overlay className='fixed inset-0 z-50 bg-black/80' />
        <DrawerPrimitive.Content
          className='bg-background fixed inset-y-0 right-0 z-50 flex w-full flex-col sm:max-w-lg'
          aria-describedby={undefined}
        >
          <DrawerPrimitive.Title className='sr-only'>
            {headerLabel}
          </DrawerPrimitive.Title>
          <div className='flex items-center justify-between border-b px-4 py-3'>
            <div className='flex items-center gap-2'>
              <MessageSquareIcon size='1rem' />
              <span className='text-sm font-semibold'>{headerLabel}</span>
            </div>
            <div className='flex items-center gap-1'>
              {messages.length > 0 && (
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={handleStartNewChat}
                  title='New chat'
                >
                  <PlusIcon size='1rem' />
                </Button>
              )}
              <Button variant='ghost' size='icon' onClick={close}>
                <XIcon size='1rem' />
              </Button>
            </div>
          </div>

          <ChatSessionProvider>
            <div className='flex min-h-0 flex-1 flex-col'>
              <div className='min-h-0 flex-1 overflow-y-auto'>
                <Interface />
              </div>

              <div className='shrink-0'>
                <BottomActiveFilters />
                <GenerateMessageForm />
              </div>
            </div>
          </ChatSessionProvider>
        </DrawerPrimitive.Content>
      </DrawerPrimitive.Portal>
    </DrawerPrimitive.Root>
  )
}

/**
 * Registers the chat-drawer FAB. Priority 0 keeps it closest to the thumb, below
 * any other FAB the page registers (e.g. the Recipe detail Edit FAB). Renders
 * nothing itself — {@link FabStack} owns the button.
 */
export function ChatFab({ context }: { context?: ChatContext }) {
  const { toggle } = useChatDrawerStore()

  useRegisterFab({
    id: 'chat-drawer',
    priority: 0,
    ariaLabel: 'Open chat',
    icon: <MessageSquareIcon />,
    onClick: () => toggle(context)
  })

  return null
}

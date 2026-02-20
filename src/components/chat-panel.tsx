'use client'

import { useEffect } from 'react'
import { MessageSquareIcon, XIcon } from 'lucide-react'
import { Drawer as DrawerPrimitive } from 'vaul'
import { cn } from '~/lib/utils'
import { useChatPanelStore } from '~/stores/chat-panel-store'
import { chatStore } from '~/stores/chat-store'
import { Interface } from '~/components/chat/interface'
import { BottomActiveFilters } from '~/components/chat/bottom-active-filters'
import { GenerateMessageForm } from '~/components/chat/generate-message-form'
import { Button } from '~/components/button'

export function ChatPanel() {
  const { isOpen, close } = useChatPanelStore()

  useEffect(() => {
    if (isOpen) {
      chatStore.getState().initializeFromStorage()
    }
  }, [isOpen])

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
            Chat
          </DrawerPrimitive.Title>
          <div className='flex items-center justify-between border-b px-4 py-3'>
            <div className='flex items-center gap-2'>
              <MessageSquareIcon size='1rem' />
              <span className='text-sm font-semibold'>Chat</span>
            </div>
            <Button variant='ghost' size='icon' onClick={close}>
              <XIcon size='1rem' />
            </Button>
          </div>

          <div className='flex min-h-0 flex-1 flex-col'>
            <div className='min-h-0 flex-1 overflow-y-auto'>
              <Interface />
            </div>

            <div className='shrink-0'>
              <BottomActiveFilters />
              <GenerateMessageForm />
            </div>
          </div>
        </DrawerPrimitive.Content>
      </DrawerPrimitive.Portal>
    </DrawerPrimitive.Root>
  )
}

export function ChatFab({ className }: { className?: string }) {
  const { toggle } = useChatPanelStore()

  return (
    <Button
      onClick={toggle}
      size='icon'
      className={cn(
        'fixed bottom-20 right-4 z-40 h-12 w-12 rounded-full shadow-lg sm:bottom-6 sm:right-6',
        className
      )}
    >
      <MessageSquareIcon />
    </Button>
  )
}

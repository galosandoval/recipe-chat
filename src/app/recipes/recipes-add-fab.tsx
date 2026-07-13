'use client'

import { useState } from 'react'
import { LinkIcon, MessageSquareIcon, PlusIcon } from 'lucide-react'
import { useChatDrawerStore } from '~/components/chat/chat-drawer-store'
import { useChatStore } from '~/components/chat/chat-store'
import { ChatPanel } from '~/components/chat-panel'
import { ParseAndAddRecipeDialogs } from '~/components/navbar/settings-dropdown-menu'
import { FloatingActionButton } from '~/components/floating-action-button'
import { useRegisterFab } from '~/components/fab-stack/use-register-fab'
import { DropdownMenu, type MenuItemProps } from '~/components/dropdown-menu'

/**
 * Floating action button to add a recipe from a chat
 */
export function RecipesAddFab() {
  const { open } = useChatDrawerStore()
  const [isAddFromUrlOpen, setIsAddFromUrlOpen] = useState(false)

  const handleAddWithChat = () => {
    const { setChatId, setIsStreaming, setMessages } = useChatStore.getState()
    setChatId('')
    setIsStreaming(false)
    setMessages([])
    open({ page: 'recipes' })
  }

  const items: MenuItemProps[] = [
    {
      label: 'recipes.addWithChat',
      icon: <MessageSquareIcon className='size-4' />,
      onClick: handleAddWithChat
    },
    {
      label: 'recipes.addFromUrl',
      icon: <LinkIcon className='size-4' />,
      onClick: () => setIsAddFromUrlOpen(true)
    }
  ]

  // The add-recipe FAB is a dropdown trigger, not a plain icon+click button, so
  // it registers via `render` — the stack still owns its position, but the
  // registration supplies the whole anchored trigger. No aria-label: the
  // pre-migration FAB had none, and migration keeps the accessible name as-is.
  useRegisterFab({
    id: 'recipes-add',
    priority: 0,
    render: () => (
      <DropdownMenu
        items={items}
        trigger={
          <FloatingActionButton>
            <PlusIcon />
          </FloatingActionButton>
        }
      />
    )
  })

  return (
    <>
      <ParseAndAddRecipeDialogs
        open={isAddFromUrlOpen}
        onOpenChange={setIsAddFromUrlOpen}
      />
      <ChatPanel />
    </>
  )
}

'use client'

import { useState } from 'react'
import { LinkIcon, MessageSquareIcon, PlusIcon } from 'lucide-react'
import { useChatDrawerStore } from '~/stores/chat-drawer-store'
import { useChatStore } from '~/stores/chat-store'
import { ChatPanel } from '~/components/chat-panel'
import { ParseAndAddRecipeDialogs } from '~/app/navbar/settings-dropdown-menu'
import { FloatingActionButton } from '~/components/floating-action-button'
import {
  DropdownMenu,
  type MenuItemProps
} from '~/components/dropdown-menu'

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

  return (
    <>
      <DropdownMenu
        items={items}
        trigger={
          <FloatingActionButton>
            <PlusIcon />
          </FloatingActionButton>
        }
      />
      <ParseAndAddRecipeDialogs
        open={isAddFromUrlOpen}
        onOpenChange={setIsAddFromUrlOpen}
      />
      <ChatPanel />
    </>
  )
}

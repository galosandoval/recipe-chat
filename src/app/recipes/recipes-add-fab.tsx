'use client'

import { useState } from 'react'
import { LinkIcon, MessageSquareIcon, PlusIcon } from 'lucide-react'
import { useChatPanelStore } from '~/stores/chat-panel-store'
import { ChatPanel } from '~/components/chat-panel'
import { ParseAndAddRecipeDialogs } from '~/app/navbar/settings-dropdown-menu'
import { Button } from '~/components/button'
import {
  DropdownMenu,
  type MenuItemProps
} from '~/components/dropdown-menu'

export function RecipesAddFab() {
  const { open } = useChatPanelStore()
  const [isAddFromUrlOpen, setIsAddFromUrlOpen] = useState(false)

  const items: MenuItemProps[] = [
    {
      label: 'recipes.addWithChat',
      icon: <MessageSquareIcon className='size-4' />,
      onClick: () => open({ page: 'recipes' })
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
          <Button
            size='icon'
            className='fixed bottom-20 right-4 z-40 h-12 w-12 rounded-full shadow-lg sm:bottom-6 sm:right-6'
          >
            <PlusIcon />
          </Button>
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

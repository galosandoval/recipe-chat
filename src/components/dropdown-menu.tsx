import { Menu, MenuButton, MenuItems } from '@headlessui/react'

export function DropdownMenu({
  children,
  icon
}: {
  children: React.ReactNode
  icon: React.ReactNode
}) {
  return (
    <Menu>
      <MenuButton className='btn btn-circle btn-ghost'>{icon}</MenuButton>
      <MenuItems
        anchor='bottom'
        transition
        className='bg-base-100 z-50 flex origin-top flex-col rounded-md transition duration-200 ease-out data-closed:scale-95 data-closed:opacity-0'
      >
        {children}
      </MenuItems>
    </Menu>
  )
}

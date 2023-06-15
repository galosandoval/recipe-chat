import { Menu, Transition } from '@headlessui/react'
import { useState } from 'react'
import { ArrowLeftOnRectangleIcon, ElipsisVerticalIcon } from './Icons'
import { AnimatePresence, motion } from 'framer-motion'
import { ThemeToggle } from './ThemeToggle'
import { signOut } from 'next-auth/react'

const dropdownMenuOptions = {
  transition: {
    duration: 0.3
  },
  initial: {
    opacity: 0,
    y: -5
  },
  animate: { opacity: 1, y: 0 },
  exit: {
    opacity: 0,
    y: -5
  }
} as const

export function DropdownMenu() {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <Menu as='div' className='relative'>
      <Menu.Button
        onClick={() => setIsOpen((state) => !state)}
        className='btn-ghost btn-circle btn mb-4'
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth={1.5}
          stroke='currentColor'
          className='h-6 w-6'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z'
          />
        </svg>
      </Menu.Button>
      <Transition
        enter='transition duration-100 ease-out'
        enterFrom='transform scale-95 opacity-0'
        enterTo='transform scale-100 opacity-100'
        leave='transition duration-75 ease-out'
        leaveFrom='transform scale-100 opacity-100'
        leaveTo='transform scale-95 opacity-0'
      >
        <Menu.Items
          // as={motion.ul}
          className='absolute right-0 top-[0.5rem] flex flex-col gap-4 rounded-md bg-primary-content py-2'
        >
          <Menu.Item>
            <>
              <ThemeToggle />
            </>
          </Menu.Item>
          <Menu.Item>
            <button
              onClick={() => signOut()}
              className='btn-ghost no-animation btn w-[8rem]'
            >
              <span>Logout</span>
              <ArrowLeftOnRectangleIcon />
            </button>
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}

import { Dialog } from '@headlessui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { Backdrop } from './Modal'

const drawerAnimationOptions = {
  transition: {
    duration: 0.3
  },
  initial: {
    opacity: 0,
    x: -50
  },
  animate: { opacity: 1, x: 0 },
  exit: {
    opacity: 0,
    x: -50
  }
} as const

export const Drawer = ({
  isOpen,
  closeModal,
  children
}: {
  isOpen: boolean
  children: React.ReactNode
  closeModal: () => void
}) => {
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <>
          <Dialog
            as={motion.div}
            {...drawerAnimationOptions}
            className='prose fixed inset-0 z-30 grid h-full w-full place-items-start bg-base-300/70'
            open={isOpen}
            onClose={closeModal}
          >
            <Dialog.Panel className='my-auto h-full w-[80%] max-w-sm transform overflow-hidden bg-base-100 p-2 text-left align-middle shadow-xl transition-all md:w-1/2'>
              {children}
            </Dialog.Panel>
          </Dialog>
          <Backdrop />
        </>
      )}
      {/* {isOpen && <Backdrop />} */}
    </AnimatePresence>
  )
}

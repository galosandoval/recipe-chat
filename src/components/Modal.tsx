import { Dialog } from '@headlessui/react'
import { AnimatePresence, motion } from 'framer-motion'
import React from 'react'

const modalAnimationOptions = {
  transition: {
    duration: 0.3
  },
  initial: {
    opacity: 0,
    scale: 0.95
  },
  animate: { opacity: 1, scale: 1 },
  exit: {
    opacity: 0,
    scale: 0.95
  }
} as const

export const Modal = ({
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
            {...modalAnimationOptions}
            className='prose fixed inset-0 z-30 grid h-full w-full place-items-center bg-base-300/70'
            open={isOpen}
            static={true}
            onClose={closeModal}
          >
            <Dialog.Panel className='my-auto w-full max-w-md transform overflow-hidden rounded-2xl bg-base-100 p-2 text-left align-middle shadow-xl transition-all md:w-1/2'>
              {children}
            </Dialog.Panel>
          </Dialog>
          <Backdrop />
        </>
      )}
    </AnimatePresence>
  )
}

export function Backdrop() {
  return (
    <motion.div className='absolute inset-0 bg-primary-content bg-opacity-25'></motion.div>
  )
}

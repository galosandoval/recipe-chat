import { Dialog } from '@headlessui/react'
import { AnimatePresence, motion } from 'framer-motion'
import React from 'react'
import { animationOptions } from '../utils/constants'

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
        <Backdrop>
          <Dialog
            as={motion.div}
            {...animationOptions}
            className='prose fixed inset-0 z-30 grid h-full w-full place-items-center bg-base-300/70'
            open={isOpen}
            onClose={closeModal}
          >
            <Dialog.Panel className='my-auto max-h-[90%] w-full max-w-lg transform overflow-hidden rounded-2xl bg-base-100 p-2 text-left align-middle shadow-xl transition-all'>
              {children}
            </Dialog.Panel>
          </Dialog>
        </Backdrop>
      )}
    </AnimatePresence>
  )
}

function Backdrop({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className='absolute inset-0 z-20 grid h-full w-full place-items-center'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {children}
    </motion.div>
  )
}

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
            className='fixed inset-0 z-10 grid h-full w-full place-items-center overflow-y-auto'
            open={isOpen}
            onClose={closeModal}
          >
            <Dialog.Panel className='min-h-[10rem] w-full max-w-lg transform overflow-hidden rounded-2xl bg-slate-100 p-2 text-left align-middle text-slate-900 shadow-xl transition-all dark:bg-slate-800 dark:text-slate-300'>
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
      className='absolute inset-0 grid h-full w-full place-items-center bg-black bg-opacity-25'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {children}
    </motion.div>
  )
}

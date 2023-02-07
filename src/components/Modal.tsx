import { Dialog } from '@headlessui/react'
import { AnimatePresence, motion } from 'framer-motion'
import React from 'react'

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
            transition={{
              duration: 0.3
            }}
            initial={{
              opacity: 0,
              scale: 0.95
            }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{
              opacity: 0,
              scale: 0.95
            }}
            static
            className='z-10 w-full h-full fixed inset-0 overflow-y-auto grid place-items-center'
            open={isOpen}
            onClose={closeModal}
          >
            <Dialog.Panel className='w-full max-w-lg transform overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-300 p-6 text-left align-middle shadow-xl transition-all min-h-[10rem]'>
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
      className='absolute inset-0 h-full w-full bg-black bg-opacity-25 grid place-items-center'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {children}
    </motion.div>
  )
}

import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react'

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
    <Dialog
      as='div'
      className='bg-secondary/70 fixed inset-0 z-30 grid h-full w-full place-items-center transition duration-300 ease-out data-closed:opacity-0'
      onClose={closeModal}
      transition
      open={isOpen}
    >
      <DialogBackdrop className='fixed inset-0 bg-black/30' />
      <div className='fixed inset-0 flex w-screen items-center justify-center p-4'>
        <DialogPanel
          transition
          className='bg-background transform overflow-hidden rounded-2xl p-2 text-left align-middle shadow-xl transition-all duration-300 ease-out data-closed:-translate-y-1'
        >
          {children}
        </DialogPanel>
      </div>
    </Dialog>
  )
}

import { Dialog, Transition, TransitionChild } from '@headlessui/react'
import { Fragment } from 'react'

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
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as='div' className='prose relative z-10' onClose={closeModal}>
          <TransitionChild
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='bg-base-300/70 fixed inset-0' />
          </TransitionChild>

          <div className='fixed inset-0 overflow-y-auto'>
            <div className='flex h-full min-h-full items-center justify-start text-center'>
              <TransitionChild
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0 -translate-x-4'
                enterTo='opacity-100 -translate-x-0'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 -translate-x-0'
                leaveTo='opacity-0 -translate-x-4'
              >
                <Dialog.Panel className='bg-base-100 my-auto h-full w-[80%] max-w-sm transform overflow-hidden p-2 text-left align-middle shadow-xl transition-all md:w-1/2'>
                  {children}
                </Dialog.Panel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

import {
	Dialog,
	DialogPanel,
	Transition,
	TransitionChild
} from '@headlessui/react'
import { Fragment } from 'react'

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
		<Transition as={Fragment} show={isOpen}>
			<Dialog
				as='div'
				className='fixed inset-0 z-30 grid h-full w-full place-items-center'
				onClose={closeModal}
			>
				<TransitionChild
					as={Fragment}
					enter='ease-out duration-300'
					enterFrom='opacity-0'
					enterTo='opacity-300'
					leaveFrom='opacity-100'
					leaveTo='opacity-0'
				>
					<div className='bg-primary-content/65 absolute inset-0'></div>
				</TransitionChild>
				<TransitionChild
					enter='ease-out duration-300'
					enterFrom='opacity-0 translate-y-1'
					enterTo='opacity-100 translate-y-0'
					leaveFrom='opacity-100 translate-y-0'
					leaveTo='opacity-0 translate-y-1'
				>
					<DialogPanel className='w-[95%] max-w-md transform overflow-hidden rounded-2xl p-2 text-left align-middle shadow-xl transition-all'>
						{children}
					</DialogPanel>
				</TransitionChild>
			</Dialog>
		</Transition>
	)
}

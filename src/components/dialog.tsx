import type { ComponentProps } from 'react'
import { Button } from './ui/button'
import {
  Dialog as DialogUI,
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter
} from './ui/dialog'

export function Dialog({
  cancelText,
  submitText,
  children,
  title,
  description,
  form,
  type = 'submit',
  isLoading,
  onClick,
  trigger,
  open,
  setOpen
}: {
  cancelText: string
  submitText: string
  children: React.ReactNode
  title: string
  description: string
  trigger: React.ReactNode
  form: string
  type: ComponentProps<typeof Button>['type']
  isLoading: boolean
  onClick?: () => void
  open?: boolean
  setOpen?: (open: boolean) => void
}) {
  return (
    <DialogUI open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className='pt-0 sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className='text-left'>
            {description}
          </DialogDescription>
        </DialogHeader>
        {children}
        <DialogFooter className='flex flex-row justify-between'>
          <DialogClose asChild>
            <Button variant='outline'>{cancelText}</Button>
          </DialogClose>
          <Button
            type={type}
            form={form}
            isLoading={isLoading}
            onClick={onClick}
          >
            {submitText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogUI>
  )
}

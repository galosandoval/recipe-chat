import type { ComponentProps } from 'react'
import { Button } from './button'
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
  onClickConfirm,
  trigger,
  open,
  onOpenChange
}: {
  cancelText: string
  submitText: string
  children: React.ReactNode
  title: string
  description: string
  trigger?: React.ReactNode
  form: string
  type: ComponentProps<typeof Button>['type']
  isLoading: boolean
  onClickConfirm?: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  return (
    <DialogUI open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className='pt-6 sm:max-w-[425px]'>
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
            onClick={onClickConfirm}
          >
            {submitText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogUI>
  )
}

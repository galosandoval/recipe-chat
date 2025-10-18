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
import { XIcon } from 'lucide-react'

export function Dialog({
  cancelText,
  submitText,
  children,
  title,
  description,
  formId,
  buttonType = 'submit',
  isLoading,
  submitIcon,
  onClickConfirm,
  trigger,
  open,
  onOpenChange
}: {
  cancelText: string
  submitText: string
  children?: React.ReactNode
  title: string
  description: string
  trigger?: React.ReactNode
  formId?: string
  buttonType?: ComponentProps<typeof Button>['type']
  isLoading?: boolean
  submitIcon?: React.ReactNode
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
            <Button variant='outline' icon={<XIcon className='h-4 w-4' />}>
              {cancelText}
            </Button>
          </DialogClose>
          <Button
            type={buttonType}
            form={formId}
            isLoading={isLoading}
            onClick={onClickConfirm}
            icon={submitIcon}
          >
            {submitText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogUI>
  )
}

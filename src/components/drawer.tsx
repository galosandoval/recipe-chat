import { XIcon } from 'lucide-react'
import { Button } from './button'
import {
  DrawerClose,
  DrawerHeader,
  DrawerContent,
  DrawerTrigger,
  Drawer as DrawerUI,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter
} from './ui/drawer'

export const Drawer = ({
  open,
  onOpenChange,
  children,
  cancelText,
  submitText,
  title,
  description,
  trigger,
  formId,
  className,
  isLoading,
  submitIcon
}: {
  cancelText?: string
  children: React.ReactNode
  submitText?: string
  title: string
  description?: string
  trigger?: React.ReactNode
  formId: string
  className?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  isLoading?: boolean
  submitIcon?: React.ReactNode
}) => {
  const isDisplayingFooter = cancelText || submitText
  return (
    <DrawerUI open={open} onOpenChange={onOpenChange}>
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <DrawerContent className={className}>
        <DrawerHeader className='text-left'>
          <DrawerTitle>{title}</DrawerTitle>
          {description && <DrawerDescription>{description}</DrawerDescription>}
        </DrawerHeader>
        <div className='px-4'>{children}</div>
        {isDisplayingFooter && (
          <DrawerFooter className='pt-4'>
            {cancelText && (
              <DrawerClose asChild>
                <Button variant='outline' icon={<XIcon className='h-4 w-4' />}>
                  {cancelText}
                </Button>
              </DrawerClose>
            )}
            {submitText && (
              <Button
                icon={submitIcon}
                type='submit'
                form={formId}
                isLoading={isLoading}
              >
                {submitText}
              </Button>
            )}
          </DrawerFooter>
        )}
      </DrawerContent>
    </DrawerUI>
  )
}

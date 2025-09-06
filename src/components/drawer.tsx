import { Button } from './ui/button'
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
  className
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
          <DrawerFooter className='pt-2'>
            {cancelText && (
              <DrawerClose asChild>
                <Button variant='outline'>{cancelText}</Button>
              </DrawerClose>
            )}
            {submitText && (
              <Button type='submit' form={formId}>
                {submitText}
              </Button>
            )}
          </DrawerFooter>
        )}
      </DrawerContent>
    </DrawerUI>
  )
}

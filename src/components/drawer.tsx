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
  formId
}: {
  cancelText: string
  children: React.ReactNode
  submitText: string
  title: string
  description: string
  trigger: React.ReactNode
  formId: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) => {
  return (
    <DrawerUI open={open} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className='text-left'>
          <DrawerTitle>{title}</DrawerTitle>
          {description && <DrawerDescription>{description}</DrawerDescription>}
        </DrawerHeader>
        <div className='px-4'>{children}</div>
        <DrawerFooter className='pt-2'>
          <DrawerClose asChild>
            <Button variant='outline'>{cancelText}</Button>
          </DrawerClose>
          <Button type='submit' form={formId}>
            {submitText}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </DrawerUI>
  )
}

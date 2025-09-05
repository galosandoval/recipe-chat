import { useTranslations, type TPaths } from '~/hooks/use-translations'
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
  cancelText?: string
  children: React.ReactNode
  submitText?: string
  title: TPaths
  description?: string
  trigger: React.ReactNode
  formId: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) => {
  const t = useTranslations()
  return (
    <DrawerUI open={open} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className='text-left'>
          <DrawerTitle>{t.get(title)}</DrawerTitle>
          {description && <DrawerDescription>{description}</DrawerDescription>}
        </DrawerHeader>
        <div className='px-4'>{children}</div>
        {cancelText ||
          (submitText && (
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
          ))}
      </DrawerContent>
    </DrawerUI>
  )
}

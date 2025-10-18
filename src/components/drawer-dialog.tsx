'use client'

import { useMediaQuery } from '~/hooks/use-media-query'
import { Dialog } from './dialog'
import { Drawer } from './drawer'

export function DrawerDialog({
  title,
  description,
  trigger,
  children,
  cancelText,
  submitText,
  formId,
  open,
  isLoading,
  onOpenChange,
  submitIcon
}: {
  title: string
  description: string
  trigger?: React.ReactNode
  children: React.ReactNode
  cancelText: string
  submitText: string
  isLoading?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /**
   * The id of the form to submit if the children are a form
   */
  formId: string
  submitIcon?: React.ReactNode
}) {
  const isDesktop = useMediaQuery('(min-width: 768px)')

  if (isDesktop) {
    return (
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
        trigger={trigger}
        cancelText={cancelText}
        submitText={submitText}
        submitIcon={submitIcon}
        title={title}
        description={description}
        formId={formId}
        buttonType='button'
        isLoading={isLoading}
      >
        {children}
      </Dialog>
    )
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      trigger={trigger}
      cancelText={cancelText}
      submitText={submitText}
      title={title}
      description={description}
      formId={formId}
      isLoading={isLoading}
      submitIcon={submitIcon}
    >
      {children}
    </Drawer>
  )
}

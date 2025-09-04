'use client'

import { useMediaQuery } from '~/hooks/use-media-query'
import React, { useState } from 'react'
import { Dialog } from './dialog'
import { Drawer } from './drawer'
import { type TPaths } from '~/hooks/use-translations'

export function DrawerDialog({
  title,
  description,
  trigger,
  children,
  cancelText,
  submitText,
  formId
}: {
  title: TPaths
  description: string
  trigger: React.ReactNode
  children: React.ReactNode
  cancelText: string
  submitText: string
  /**
   * The id of the form to submit if the children are a form
   */
  formId: string
}) {
  const [open, setOpen] = useState(false)
  const isDesktop = useMediaQuery('(min-width: 768px)')

  if (isDesktop) {
    return (
      <Dialog
        open={open}
        setOpen={setOpen}
        trigger={trigger}
        cancelText={cancelText}
        submitText={submitText}
        title={title}
        description={description}
        form={formId}
        type='button'
        isLoading={false}
      >
        {children}
      </Dialog>
    )
  }

  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      cancelText={cancelText}
      submitText={submitText}
      title={title}
      description={description}
      formId={formId}
    >
      {children}
    </Drawer>
  )
}

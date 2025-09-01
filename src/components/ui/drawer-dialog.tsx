'use client'

import { cn } from '~/lib/utils'
import { useMediaQuery } from '~/hooks/use-media-query'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '~/components/ui/dialog'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from '~/components/ui/drawer'
import React, { useState } from 'react'

export function DrawerDialog({
  title,
  description,
  trigger,
  children,
  cancelText,
  submitText
}: {
  title: string
  description: string
  trigger: React.ReactNode
  children: React.ReactNode
  cancelText: string
  submitText: string
}) {
  const [open, setOpen] = useState(false)
  const isDesktop = useMediaQuery('(min-width: 768px)')

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
          {children}
          <DrawerFooter className='pt-2'>
            <DrawerClose asChild>
              <Button variant='outline'>{cancelText}</Button>
            </DrawerClose>
            <Button type='submit'>{submitText}</Button>
          </DrawerFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className='text-left'>
          <DrawerTitle>{title}</DrawerTitle>
          {description && <DrawerDescription>{description}</DrawerDescription>}
        </DrawerHeader>
        {children}
        <DrawerFooter className='pt-2'>
          <DrawerClose asChild>
            <Button variant='outline'>{cancelText}</Button>
          </DrawerClose>
          <Button type='submit'>{submitText}</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

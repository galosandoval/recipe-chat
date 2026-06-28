'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { AnimatePresence, motion } from 'motion/react'
import { XIcon } from 'lucide-react'

import { cn } from '~/lib/utils'
import { useControllableOpen } from '~/components/motion/use-controllable-open'
import {
  dialogVariants,
  durations,
  ease,
  overlayVariants
} from '~/components/motion/transitions'

/**
 * Mirrors the dialog's open state so {@link DialogContent} can drive Motion's
 * `AnimatePresence` (which needs the value in React) while Radix keeps owning
 * focus trapping, keyboard handling, and dismissal.
 */
const DialogOpenContext = React.createContext(false)

/**
 * Drop-in for Radix's Dialog root that additionally publishes the open state on
 * {@link DialogOpenContext}. Supports the same controlled/uncontrolled API, so
 * call sites are unchanged.
 */
function Dialog({
  open,
  defaultOpen,
  onOpenChange,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>) {
  const [isOpen, setOpen] = useControllableOpen({
    open,
    defaultOpen,
    onOpenChange
  })

  return (
    <DialogOpenContext.Provider value={isOpen}>
      <DialogPrimitive.Root open={isOpen} onOpenChange={setOpen} {...props} />
    </DialogOpenContext.Provider>
  )
}

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay asChild forceMount {...props}>
    <motion.div
      ref={ref}
      className={cn('fixed inset-0 z-50 bg-black/80', className)}
      variants={overlayVariants}
      initial='closed'
      animate='open'
      exit='closed'
      transition={{ duration: durations.fast, ease }}
    />
  </DialogPrimitive.Overlay>
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const open = React.useContext(DialogOpenContext)

  return (
    <AnimatePresence>
      {open && (
        <DialogPortal forceMount key='dialog'>
          <DialogOverlay />
          <DialogPrimitive.Content asChild forceMount {...props}>
            <motion.div
              ref={ref}
              className={cn(
                'bg-background fixed top-[50%] left-[50%] z-50 grid w-full max-w-lg gap-4 border p-6 shadow-lg sm:rounded-md',
                className
              )}
              // Centering lives in Motion's transform (via x/y) so it composes
              // with the animated scale instead of being wiped by it.
              style={{ x: '-50%', y: '-50%' }}
              variants={dialogVariants}
              initial='closed'
              animate='open'
              exit='closed'
              transition={{ duration: durations.base, ease }}
            >
              {children}
              <DialogPrimitive.Close className='ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none'>
                <XIcon className='h-4 w-4' />
                <span className='sr-only'>Close</span>
              </DialogPrimitive.Close>
            </motion.div>
          </DialogPrimitive.Content>
        </DialogPortal>
      )}
    </AnimatePresence>
  )
})
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-1.5 text-center sm:text-left',
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = 'DialogHeader'

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = 'DialogFooter'

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'text-lg leading-none font-semibold tracking-tight',
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-muted-foreground text-sm', className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription
}

import { act, fireEvent, render, screen } from '@testing-library/react'
import { Toaster } from 'sonner'
import { toast } from './toast'

/**
 * jsdom never runs sonner's post-animation unmount, so the toast element stays
 * in the DOM either way — `data-removed` is what sonner flips when a dismiss
 * actually lands on the toast, and is the only honest signal here.
 */
const isDismissed = () =>
  document.querySelector('[data-sonner-toast]')?.getAttribute('data-removed')

const flush = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 300))
  })

it('dismisses a toast when its close button is clicked', async () => {
  render(<Toaster position='top-right' toastOptions={{ unstyled: true }} />)

  toast.error('Something broke')
  await screen.findByText('Something broke')
  expect(isDismissed()).toBe('false')

  fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
  await flush()

  expect(isDismissed()).toBe('true')
})

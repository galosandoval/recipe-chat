'use client'

import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { api } from '~/trpc/react'
import { useTranslations } from '~/hooks/use-translations'
import { DrawerDialog } from '~/components/drawer-dialog'
import { useTasteProfileDrawerStore } from './taste-profile-drawer-store'
import { TasteProfileQuiz } from './taste-profile-quiz'

/**
 * Hosts the taste-profile quiz inside the app's drawer/dialog overlay so it can
 * be opened from anywhere without leaving the current screen. Mount once at a
 * persistent spot (e.g. the navbar). Open state is driven by
 * {@link useTasteProfileDrawerStore}; first-run is auto-triggered here.
 *
 * Closing the drawer replaces the old Skip button: dismissing before Finish
 * saves sensible defaults via `tasteProfile.skip`, while finishing closes
 * without a second save (guarded by `completedRef`).
 */
export function TasteProfileDrawer() {
  const t = useTranslations()
  const isOpen = useTasteProfileDrawerStore((s) => s.isOpen)
  const setOpen = useTasteProfileDrawerStore((s) => s.setOpen)

  /** True once Finish has upserted, so the ensuing close doesn't re-save. */
  const completedRef = useRef(false)

  const { status } = useSession()
  const isAuthenticated = status === 'authenticated'
  const { data: profile } = api.tasteProfile.get.useQuery(undefined, {
    enabled: isAuthenticated
  })
  const hasProfile = profile != null

  const utils = api.useUtils()
  const skip = api.tasteProfile.skip.useMutation({
    onSuccess: () => utils.tasteProfile.get.invalidate()
  })

  // Only first-run users (query settled to a definite `null`) get auto-opened;
  // `undefined` means still loading, so we don't flash the overlay open.
  useAutoOpenForFirstRun(isAuthenticated && profile === null)

  const handleOpenChange = (next: boolean) => {
    if (next) {
      completedRef.current = false
    } else if (
      !hasProfile &&
      !completedRef.current &&
      skip.status !== 'pending'
    ) {
      // First-run dismissal saves sensible defaults (replaces Skip). A returning
      // user editing an existing profile is left untouched on dismiss — we must
      // never clobber their saved profile with defaults.
      skip.mutate()
    }
    setOpen(next)
  }

  const handleComplete = () => {
    completedRef.current = true
    setOpen(false)
  }

  return (
    <DrawerDialog
      title={t.onboarding.title}
      description={t.onboarding.description}
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      {isOpen && <TasteProfileQuiz onComplete={handleComplete} />}
    </DrawerDialog>
  )
}

/**
 * Opens the drawer once for an authenticated user who has no saved profile,
 * preserving first-run onboarding now that it's an overlay rather than a route.
 */
function useAutoOpenForFirstRun(shouldAutoOpen: boolean) {
  const open = useTasteProfileDrawerStore((s) => s.open)
  const autoOpenedRef = useRef(false)

  useEffect(() => {
    if (autoOpenedRef.current || !shouldAutoOpen) return
    autoOpenedRef.current = true
    open()
  }, [shouldAutoOpen, open])
}

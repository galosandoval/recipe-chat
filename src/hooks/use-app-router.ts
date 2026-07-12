'use client'
import { useRouter } from 'next/navigation'
import { useNavigationStore } from '~/components/navigation-store'

export function useAppRouter() {
  const router = useRouter()
  const startNavigation = useNavigationStore((state) => state.startNavigation)

  return {
    push: (route: string) => {
      startNavigation(route)
      router.push(route)
    }
  }
}

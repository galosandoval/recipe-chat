import { useSession } from 'next-auth/react'

export function useUserId() {
  const session = useSession()
  const userId = session.data?.user?.id

  if (!userId) {
    throw new Error('User ID is required')
  }

  return userId
}

import { useSession } from 'next-auth/react'

export function useUserId() {
	const session = useSession()

	const userId = session.data?.user?.id ?? ''

	return userId
}

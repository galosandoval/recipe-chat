'use client'

import { useSession } from 'next-auth/react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { User } from 'lucide-react'
import { useTranslations } from '~/hooks/use-translations'

export function UserAvatar() {
	return (
		<Avatar className='h-8 w-8'>
			<UserImage />
			<AvatarFallback>
				<User size={16} />
			</AvatarFallback>
		</Avatar>
	)
}

export function UserImage() {
	const { data: session } = useSession()
	console.log('session', session)
	if (session?.user.image) {
		return (
			<AvatarImage
				height={16}
				width={16}
				src={session.user.image}
				className='rounded-full'
			/>
		)
	}

	return null
}

export function AssistantAvatar() {
	const t = useTranslations()
	return (
		<Avatar className='h-8 w-8'>
			<AvatarImage
				height={16}
				width={16}
				src='/images/favicon-32x32.png'
			/>
			<AvatarFallback>{t.components.avatars.assistant}</AvatarFallback>
		</Avatar>
	)
}

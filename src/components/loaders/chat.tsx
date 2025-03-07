import { AssistantAvatar } from '~/components/avatars'

export const ChatLoader = () => {
	return (
		<div className='py-4 pb-4 pl-4'>
			<div className='mx-auto flex justify-start gap-2'>
				<AssistantAvatar />
				<div className='flex items-center justify-start space-x-1'>
					<div
						style={{
							animationDelay: '0.0s',
							animationDuration: '1s'
						}}
						className='h-2 w-2 animate-pulse rounded-full bg-foreground'
					></div>
					<div
						style={{
							animationDelay: '0.25s',
							animationDuration: '1s'
						}}
						className='h-2 w-2 animate-pulse rounded-full bg-foreground'
					></div>
					<div
						style={{
							animationDelay: '0.5s',
							animationDuration: '1s'
						}}
						className='h-2 w-2 animate-pulse rounded-full bg-foreground'
					></div>
				</div>
			</div>
		</div>
	)
}

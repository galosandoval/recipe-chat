import { api, HydrateClient } from '~/trpc/server'
import ChatWindow from './chat/chat-window'
import { ScrollProvider } from '~/hooks/use-scroll-to-bottom'
import { SubmitPromptForm } from './chat/submit-prompt-form'
import { auth } from '~/server/auth'
import { cn } from '~/lib/utils'
import { cookies } from 'next/headers'

export default async function Home() {
	// const hello = await api.post.hello({ text: "from tRPC" });
	const session = await auth()
	console.log('session', session)
	if (session) {
		const cookieStore = await cookies()
		const currentChatId = cookieStore.get('currentChatId')
		console.log('currentChatId', currentChatId)
		if (currentChatId) {
			void api.chats.getChat.prefetch({ id: currentChatId.value })
		}
	}
	// if (session?.user) {
	//   void api.post.getLatest.prefetch();
	// }
	return (
		<HydrateClient>
			<main className='transition-width relative flex h-[100svh] w-full flex-1 flex-col items-stretch'>
				<ScrollProvider>
					<div
						className={cn(
							'relative flex h-full flex-1 flex-col items-stretch overflow-auto',
							session ? 'pt-20' : 'pt-9'
						)}
					>
						<div
							id='chat-window'
							className='flex-1 overflow-y-auto'
						>
							<ChatWindow />
						</div>
						<SubmitPromptForm />
					</div>
				</ScrollProvider>
			</main>
		</HydrateClient>
	)
}

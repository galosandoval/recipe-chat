import { HydrateClient } from '~/trpc/server'
import ChatWindow from './chat/chat-window'
import { SubmitPromptForm } from '~/app/chat/submit-prompt-form'
import { ScrollProvider } from '~/hooks/use-scroll-to-bottom'

export default async function Home() {
	// const hello = await api.post.hello({ text: "from tRPC" });
	// const session = await auth();

	// if (session?.user) {
	//   void api.post.getLatest.prefetch();
	// }

	return (
		<HydrateClient>
			<main className='transition-width relative flex h-[100svh] w-full flex-1 flex-col items-stretch'>
				<ScrollProvider>
					<div className='relative flex h-full flex-1 flex-col items-stretch overflow-auto'>
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

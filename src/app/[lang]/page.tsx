import { HydrateClient } from '~/trpc/server'
import ChatWindow from './chat/chat-window'
import { SubmitPromptForm } from '~/app/[lang]/chat/submit-prompt-form'
import { ScrollProvider } from '~/hooks/use-scroll-to-bottom'

export default async function Home() {
	// const hello = await api.post.hello({ text: "from tRPC" });
	// const session = await auth();

	// if (session?.user) {
	//   void api.post.getLatest.prefetch();
	// }

	return (
		<HydrateClient>
			<ScrollProvider>
				<div className='relative flex h-full flex-1 flex-col items-stretch overflow-auto'>
					<div id='chat-window' className='flex-1 overflow-y-auto'>
						<ChatWindow />
					</div>
					<SubmitPromptForm />
				</div>
			</ScrollProvider>
		</HydrateClient>
	)
}

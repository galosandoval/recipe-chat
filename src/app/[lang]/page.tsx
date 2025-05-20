import { HydrateClient } from '~/trpc/server'
import ChatWindow from './chat/chat-window'
import { ScrollProvider } from '~/hooks/use-scroll-to-bottom'
import { SubmitPromptForm } from './chat/submit-prompt-form'
import { auth } from '~/server/auth'
import { cn } from '~/lib/utils'

// Allow 30 seconds for the chat to stream
export const maxDuration = 30

export default async function Home() {
	// const hello = await api.post.hello({ text: "from tRPC" });
	// if (session?.user) {
	//   void api.post.getLatest.prefetch();
	// }
	return (
		<HydrateClient>
			<main className='relative flex w-full flex-col'>
				<ScrollProvider>
					<ChatWindow />
					<SubmitPromptForm />
				</ScrollProvider>
			</main>
		</HydrateClient>
	)
}

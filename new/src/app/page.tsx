import Link from 'next/link'

import { LatestPost } from '~/components/post'
import { auth } from '~/server/auth'
import { api, HydrateClient } from '~/trpc/server'
import ChatWindow from '../components/chat-window'
import { SubmitMessageForm } from '~/components/submit-message-form'

export default async function Home() {
  // const hello = await api.post.hello({ text: "from tRPC" });
  // const session = await auth();

  // if (session?.user) {
  //   void api.post.getLatest.prefetch();
  // }

  return (
    <HydrateClient>
      <main className='flex min-h-svh flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white'>
        <div className='relative flex h-full flex-1 flex-col items-stretch overflow-auto'>
          <div className='flex-1 overflow-hidden'>
            <ChatWindow />
          </div>
          <SubmitMessageForm
          // input={input}
          // isSendingMessage={isSendingMessage}
          // handleSubmit={handleSubmit}
          // handleInputChange={handleInputChange}
          />
        </div>
      </main>
    </HydrateClient>
  )
}

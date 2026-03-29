import { BotMessageSquareIcon } from 'lucide-react'
import { Avatar } from '~/components/chat/avatar'
import { RotatingPhrases } from '~/components/loaders/rotating-phrases'

export function AssistantMessageLoader() {
  return (
    <div className="bg-transparent pb-4">
      <div className="mx-auto flex justify-start gap-2">
        <Avatar icon={<BotMessageSquareIcon />} />
        <div className="flex items-center justify-start w-full">
          <RotatingPhrases />
        </div>
      </div>
    </div>
  )
}

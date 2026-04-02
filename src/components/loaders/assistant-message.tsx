'use client'

import { BotMessageSquareIcon } from 'lucide-react'
import { Avatar } from '~/components/chat/avatar'
import { RotatingPhrases } from '~/components/loaders/rotating-phrases'
import { useTranslations } from '~/hooks/use-translations'

export function AssistantMessageLoader() {
  const t = useTranslations()

  return (
    <div className="bg-transparent pb-4">
      <div className="mx-auto flex justify-start gap-2">
        <Avatar icon={<BotMessageSquareIcon />} />
        <div className="flex items-center justify-start w-full">
          <RotatingPhrases phrases={t.loaders.cookingPhrases as unknown as string[]} />
        </div>
      </div>
    </div>
  )
}

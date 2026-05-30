'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '~/lib/utils'

function shuffleArray(arr: string[]) {
  const shuffled = [...arr]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function RotatingPhrases({
  phrases,
  interval = 2500
}: {
  phrases: string[]
  interval?: number
}) {
  const queueRef = useRef<string[]>([])
  const lastPhraseRef = useRef('')

  const getNextPhrase = useCallback(() => {
    if (queueRef.current.length === 0) {
      queueRef.current = shuffleArray(phrases)
      if (queueRef.current[0] === lastPhraseRef.current) {
        const temp = queueRef.current[0]
        queueRef.current[0] = queueRef.current[queueRef.current.length - 1]
        queueRef.current[queueRef.current.length - 1] = temp
      }
    }
    const next = queueRef.current.pop()!
    lastPhraseRef.current = next
    return next
  }, [phrases])

  const [currentPhrase, setCurrentPhrase] = useState(() => getNextPhrase())
  const [nextPhrase, setNextPhrase] = useState<string | null>(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setNextPhrase(getNextPhrase())
    }, interval)
    return () => clearInterval(timer)
  }, [interval, getNextPhrase])

  const handleEnterAnimationEnd = () => {
    if (nextPhrase === null) return
    setCurrentPhrase(nextPhrase)
    setNextPhrase(null)
  }

  return (
    <div className='relative h-6 w-full overflow-hidden'>
      <span
        className={cn(
          'text-muted-foreground absolute inset-0 flex items-center text-sm',
          nextPhrase && 'phrase-exit'
        )}
      >
        {currentPhrase}
      </span>
      {nextPhrase && (
        <span
          className='text-muted-foreground phrase-enter absolute inset-0 flex items-center text-sm'
          onAnimationEnd={handleEnterAnimationEnd}
        >
          {nextPhrase}
        </span>
      )}
    </div>
  )
}

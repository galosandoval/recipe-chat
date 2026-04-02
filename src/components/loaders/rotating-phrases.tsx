'use client'

import { useEffect, useRef, useState } from 'react'

const ANIMATION_DURATION = 300

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
  interval = 2500,
}: {
  phrases: string[]
  interval?: number
}) {
  const queueRef = useRef<string[]>([])
  const lastPhraseRef = useRef('')

  function getNextPhrase() {
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
  }

  const [currentPhrase, setCurrentPhrase] = useState(() => getNextPhrase())
  const [nextPhrase, setNextPhrase] = useState<string | null>(null)
  const [phase, setPhase] = useState<'showing' | 'transitioning'>('showing')

  useEffect(() => {
    const timer = setInterval(() => {
      const next = getNextPhrase()
      setNextPhrase(next)
      setPhase('transitioning')

      const animTimer = setTimeout(() => {
        setCurrentPhrase(next)
        setNextPhrase(null)
        setPhase('showing')
      }, ANIMATION_DURATION)

      return () => clearTimeout(animTimer)
    }, interval)

    return () => clearInterval(timer)
  }, [interval, phrases])

  return (
    <div className="relative h-6 overflow-hidden w-full">
      <span
        className={`text-muted-foreground absolute inset-0 flex items-center text-sm ${phase === 'transitioning' ? 'phrase-exit' : ''}`}
      >
        {currentPhrase}
      </span>
      {phase === 'transitioning' && nextPhrase && (
        <span className="phrase-enter text-muted-foreground absolute inset-0 flex items-center text-sm">
          {nextPhrase}
        </span>
      )}
    </div>
  )
}

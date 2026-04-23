'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from '~/hooks/use-translations'
import { cn } from '~/lib/utils'

const ANIMATION_DURATION = 200

const PHRASE_KEYS = [
  'preheatOven',
  'chopOnions',
  'minceGarlic',
  'simmerBroth',
  'whiskBatter',
  'kneadDough',
  'seasonToTaste',
  'sauteVegetables',
  'reduceSauce',
  'foldInCheese',
  'zestLemon',
  'caramelizeSugar',
  'toastSpices',
  'blanchGreens',
  'deglazePan',
  'basteRoast',
  'proofYeast',
  'temperChocolate',
  'marinateProtein',
  'plateTheDish'
] as const

type PhraseKey = (typeof PHRASE_KEYS)[number]

function shuffle(arr: readonly PhraseKey[]): PhraseKey[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function RotatingPhrases({ interval = 2500 }: { interval?: number }) {
  const shuffled = shuffle(PHRASE_KEYS)
  const t = useTranslations()
  const [idx, setIdx] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const animTimerRef = useRef<NodeJS.Timeout>(undefined)

  useEffect(() => {
    const timer = setInterval(() => {
      setIsAnimating(true)
      animTimerRef.current = setTimeout(() => {
        setIsAnimating(false)
        setIdx((i) => i + 1)
      }, ANIMATION_DURATION)
    }, interval)

    return () => {
      clearInterval(timer)
      clearTimeout(animTimerRef.current)
    }
  }, [interval])

  const current = t.loaders.cookingPhrases[
    shuffled[idx % shuffled.length]
  ] as string
  const next = t.loaders.cookingPhrases[
    shuffled[(idx + 1) % shuffled.length]
  ] as string

  return (
    <div className='relative h-6 w-full overflow-hidden'>
      <span
        className={cn(
          'text-muted-foreground absolute flex items-center text-sm',
          isAnimating ? 'animate-exit' : 'translate-y-0 opacity-100'
        )}
      >
        {current}
      </span>
      <span
        className={cn(
          'text-muted-foreground absolute flex items-center text-sm',
          isAnimating ? 'animate-enter' : 'translate-y-full opacity-0'
        )}
      >
        {next}
      </span>
    </div>
  )
}

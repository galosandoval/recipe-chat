'use client'

import { Reveal } from '~/components/motion/reveal'

/**
 * The shell every landing section below the hero shares: a centered column at
 * reading width, its heading and supporting line, and the single {@link Reveal}
 * whose entrance the section's contents stagger off (pass them
 * `trigger='parent'` with a `stepDelay` from ./landing-step-delay).
 */
export function LandingSection({
  heading,
  description,
  children
}: {
  heading: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className='flex flex-col items-center px-4 py-16'>
      <Reveal className='flex w-full max-w-md flex-col gap-4'>
        <div className='flex flex-col gap-2 text-center'>
          <h2 className='text-2xl font-semibold tracking-tight text-balance sm:text-3xl'>
            {heading}
          </h2>
          <p className='text-muted-foreground text-base text-balance'>
            {description}
          </p>
        </div>

        {children}
      </Reveal>
    </section>
  )
}

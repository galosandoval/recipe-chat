'use client'

import { FilterIcon, SettingsIcon, UtensilsIcon } from 'lucide-react'
import { Badge } from '~/components/badge'
import { FilterBadge } from '~/components/chat/recipe-filters/filter-badge'
import { Reveal } from '~/components/motion/reveal'
import { Toggle } from '~/components/toggle'
import { useTranslations } from '~/hooks/use-translations'
import { LandingCard } from './landing-card'
import { LandingSection, stepDelay } from './landing-section'

/**
 * The landing page's "it knows your kitchen" section: three compact cards
 * mirroring what the real chat welcome shows a signed-in cook — their Taste
 * Profile, the use-my-pantry option, and their Filters. The point is that a
 * suggestion here is grounded in this kitchen, not a generic chatbot's guess.
 *
 * Built from the chat's own {@link Badge}, {@link Toggle} and
 * {@link FilterBadge} so it can't drift from the surfaces it stands in for.
 * Entirely static: the copy comes from the translation catalog, the Toggle and
 * the pills are decorative, and nothing here reads or writes a profile.
 * {@link Reveal} carries the reduced-motion handling — the section renders
 * settled and static when the visitor asks for less motion.
 */
export function LandingKitchen() {
  const t = useTranslations()

  return (
    <LandingSection
      heading={t.landing.kitchen.heading}
      description={t.landing.kitchen.description}
    >
      <Reveal trigger='parent' delay={stepDelay(1)}>
        <TasteProfileCard />
      </Reveal>
      <Reveal trigger='parent' delay={stepDelay(2)}>
        <PantryOptionCard />
      </Reveal>
      <Reveal trigger='parent' delay={stepDelay(3)}>
        <FiltersCard />
      </Reveal>
    </LandingSection>
  )
}

/** The Taste Profile summary as the chat welcome shows it, for a sample cook. */
function TasteProfileCard() {
  const t = useTranslations()
  const profile = t.landing.kitchen.tasteProfile
  const cuisines = [profile.cuisines.first, profile.cuisines.second]

  return (
    <LandingCard
      icon={<UtensilsIcon size={16} />}
      label={t.valueProps.yourTasteProfile}
    >
      <div className='flex flex-col gap-3'>
        <ProfileRow label={t.valueProps.skill}>
          <ProfileChip label={profile.skill} />
        </ProfileRow>
        <ProfileRow label={t.valueProps.household}>
          <ProfileChip label={profile.household} />
        </ProfileRow>
        <ProfileRow label={t.valueProps.cuisines}>
          {cuisines.map((cuisine) => (
            <ProfileChip key={cuisine} label={cuisine} />
          ))}
        </ProfileRow>
        <ProfileRow label={t.valueProps.dietary}>
          <ProfileChip label={profile.dietary} />
        </ProfileRow>
      </div>
    </LandingCard>
  )
}

/** The chat's use-my-pantry option, on and inert. */
function PantryOptionCard() {
  const t = useTranslations()

  return (
    <LandingCard
      icon={<SettingsIcon size={16} />}
      label={t.valueProps.chatOptions}
    >
      <Toggle
        pressed
        id='landingUsePantry'
        label={t.valueProps.usePantry}
        isDecorative
      />
    </LandingCard>
  )
}

/** Three of the stock filters every account starts with, two of them left on. */
function FiltersCard() {
  const t = useTranslations()
  const filters = [
    { name: t.filters.initial['under-30-minutes'], checked: true },
    { name: t.filters.initial['one-pot'], checked: true },
    { name: t.filters.initial['kid-friendly'], checked: false }
  ]

  return (
    <LandingCard icon={<FilterIcon size={16} />} label={t.filters.title}>
      <div className='flex flex-wrap gap-2'>
        {filters.map((filter) => (
          <FilterBadge
            key={filter.name}
            name={filter.name}
            checked={filter.checked}
          />
        ))}
      </div>
    </LandingCard>
  )
}

function ProfileRow({
  label,
  children
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className='flex items-start justify-between gap-2 text-sm'>
      <span className='text-muted-foreground shrink-0'>{label}</span>
      <div className='flex flex-wrap justify-end gap-1'>{children}</div>
    </div>
  )
}

/**
 * A Taste Profile value as the chat welcome shows it. No `capitalize` here,
 * unlike the real summary: these values are copy, already cased by the
 * translator, and capitalizing would re-case hyphenated words like "Peanut-free".
 */
function ProfileChip({ label }: { label: string }) {
  return <Badge variant='muted' labelClassName='text-xs' label={label} />
}

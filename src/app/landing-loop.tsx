'use client'

import {
  ArrowDownIcon,
  BotMessageSquareIcon,
  CheckIcon,
  CircleIcon,
  PackageIcon,
  ShoppingCartIcon
} from 'lucide-react'
import { Badge } from '~/components/badge'
import { ChatMessage } from '~/components/chat/message'
import { IngredientItemDisplay } from '~/components/ingredient-item-display'
import { Reveal } from '~/components/motion/reveal'
import { Toggle } from '~/components/toggle'
import { useTranslations, type Translations } from '~/hooks/use-translations'
import { LandingCard } from './landing-card'
import { LandingSection, stepDelay } from './landing-section'

/** The chat reply is step one and the Grocery List step two; its rows tick from the third. */
const FIRST_ROW_STEP = 3

/**
 * What the sample Grocery List carries over into the pantry. The quantity and
 * the unit's key live here rather than in the catalog because neither is copy —
 * only the unit's label and the item's name get translated.
 */
const items = [
  { key: 'first', quantity: 1.5, unitKey: 'lb', unitType: 'weight' },
  { key: 'second', quantity: 1, unitKey: 'bunch', unitType: 'count' },
  { key: 'third', quantity: 2, unitKey: 'piece', unitType: 'count' }
] as const

/**
 * The landing page's loop section: a chat reply hands a recipe's ingredients to
 * the Grocery List, whose rows tick themselves off one after another as the
 * section scrolls into view, and the same items land in the Pantry below. It
 * answers "and then what?" — the product carries a recipe through to shopping
 * and to what's on hand, rather than stopping at generation.
 *
 * Built from the real {@link ChatMessage}, {@link Toggle} row and
 * {@link IngredientItemDisplay} so it can't drift from the pages it stands in
 * for. Entirely static: the rows are decorative and nothing here reads a list.
 * Each tick is a {@link Reveal} like every other entrance here, which is what
 * carries the reduced-motion handling — with less motion asked for, every row
 * renders already checked and the section sits static.
 */
export function LandingLoop() {
  const t = useTranslations()

  return (
    <LandingSection
      heading={t.landing.loop.heading}
      description={t.landing.loop.description}
    >
      <ChatMessage
        content={t.landing.loop.reply}
        icon={<BotMessageSquareIcon />}
      />

      <HandoffArrow />

      <Reveal trigger='parent' delay={stepDelay(2)}>
        <GroceryListCard />
      </Reveal>

      <HandoffArrow />

      <Reveal trigger='parent' delay={stepDelay(FIRST_ROW_STEP + items.length)}>
        <PantryCard />
      </Reveal>
    </LandingSection>
  )
}

/** The Grocery List as the list page shows it, each row ticking itself off in turn. */
function GroceryListCard() {
  const t = useTranslations()

  return (
    <LandingCard icon={<ShoppingCartIcon size={16} />} label={t.nav.list}>
      <div className='flex flex-col gap-2'>
        {items.map((item, index) => (
          <Toggle
            key={item.key}
            id={`landingGrocery-${item.key}`}
            pressed
            isDecorative
            label={<IngredientItemDisplay ingredient={toIngredient(item, t)} />}
            iconSlot={
              <TickingCheck delay={stepDelay(FIRST_ROW_STEP + index)} />
            }
          />
        ))}
      </div>
    </LandingCard>
  )
}

/** The same items once they've been checked off, now on hand in the pantry. */
function PantryCard() {
  const t = useTranslations()

  return (
    <LandingCard icon={<PackageIcon size={16} />} label={t.nav.pantry}>
      <div className='flex flex-wrap gap-2'>
        {items.map((item) => (
          <Badge
            key={item.key}
            variant='muted'
            labelClassName='text-xs'
            label={t.landing.loop.items[item.key]}
          />
        ))}
      </div>
    </LandingCard>
  )
}

/**
 * A checkbox with its check rising in on cue — the row ticking itself off with
 * no state to flip. The check lands over the circle rather than replacing it, so
 * nothing shifts as it arrives, and it's a {@link Reveal} so a visitor who asked
 * for less motion simply finds the row already checked.
 */
function TickingCheck({ delay }: { delay: number }) {
  return (
    <span className='relative flex size-4 shrink-0 items-center justify-center'>
      <CircleIcon className='absolute inset-0' />
      <Reveal trigger='parent' delay={delay} className='flex'>
        <CheckIcon className='size-3!' />
      </Reveal>
    </span>
  )
}

/** The down-arrow between two steps of the loop. Decoration, not a control. */
function HandoffArrow() {
  return (
    <ArrowDownIcon
      aria-hidden='true'
      className='text-muted-foreground mx-auto size-5'
    />
  )
}

/** Shapes a sample item as the ingredient the real list and pantry rows display. */
function toIngredient(item: (typeof items)[number], t: Translations) {
  return {
    quantity: item.quantity,
    unit: t.pantry.units[item.unitKey],
    unitType: item.unitType,
    itemName: t.landing.loop.items[item.key]
  }
}

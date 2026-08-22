'use client'

import {
  ArrowDownIcon,
  BotMessageSquareIcon,
  CircleCheckIcon,
  CircleIcon,
  PackageIcon,
  ShoppingCartIcon
} from 'lucide-react'
import { ChatMessage } from '~/components/chat/message'
import { IngredientItemDisplay } from '~/components/ingredient-item-display'
import { Reveal } from '~/components/motion/reveal'
import { DecorativeToggle } from '~/components/toggle'
import { useTranslations, type Translations } from '~/hooks/use-translations'
import { LandingCard, LandingChip } from './landing-card'
import { LandingSection } from './landing-section'
import { stepDelay } from './landing-step-delay'

/** The chat reply is step one and the Grocery List step two; its rows tick from the third. */
const FIRST_ROW_STEP = 3

/**
 * What the sample Grocery List carries over into the pantry. The quantity and
 * the unit's key live here rather than in the catalog because neither is copy —
 * only the unit's label and the item's name get translated.
 */
const LIST_ITEMS = [
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
 * Built from the real {@link ChatMessage}, {@link DecorativeToggle} row and
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

      <Reveal
        trigger='parent'
        delay={stepDelay(FIRST_ROW_STEP + LIST_ITEMS.length)}
      >
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
        {LIST_ITEMS.map((item, index) => (
          <TickingRow
            key={item.key}
            item={item}
            delay={stepDelay(FIRST_ROW_STEP + index)}
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
        {LIST_ITEMS.map((item) => (
          <LandingChip key={item.key} label={t.landing.loop.items[item.key]} />
        ))}
      </div>
    </LandingCard>
  )
}

/**
 * A Grocery List row that checks itself off on cue: it renders unchecked, then
 * the checked row's accent fill and its {@link CircleCheckIcon} arrive together
 * on top of it — the row going from unticked to ticked with no state to flip.
 * Both halves are {@link Reveal}s, so a visitor who asked for less motion simply
 * finds the row already checked.
 */
function TickingRow({
  item,
  delay
}: {
  item: (typeof LIST_ITEMS)[number]
  delay: number
}) {
  const t = useTranslations()

  return (
    <div className='relative overflow-hidden rounded-md'>
      <Reveal
        trigger='parent'
        delay={delay}
        className='bg-accent absolute inset-0'
      />
      <DecorativeToggle
        pressed={false}
        className='relative'
        label={<IngredientItemDisplay ingredient={toIngredient(item, t)} />}
        icon={<TickingCheck delay={delay} />}
      />
    </div>
  )
}

/**
 * The row's checkbox mid-tick: the unchecked circle with the list page's own
 * checked mark landing over it, so nothing shifts as it arrives.
 */
function TickingCheck({ delay }: { delay: number }) {
  return (
    <span className='relative flex size-4 shrink-0 items-center justify-center'>
      <CircleIcon className='absolute inset-0' />
      <Reveal
        trigger='parent'
        delay={delay}
        className='absolute inset-0 flex items-center justify-center'
      >
        <CircleCheckIcon />
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
function toIngredient(item: (typeof LIST_ITEMS)[number], t: Translations) {
  return {
    quantity: item.quantity,
    unit: t.pantry.units[item.unitKey],
    unitType: item.unitType,
    itemName: t.landing.loop.items[item.key]
  }
}

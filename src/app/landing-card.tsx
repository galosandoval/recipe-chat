import { Badge } from '~/components/badge'
import { SectionHeader } from '~/components/chat/section-header'
import { Card } from '~/components/ui/card'

/**
 * One surface of the app as a landing section shows it: the app's own
 * {@link SectionHeader} over whatever stands in for that page's contents.
 */
export function LandingCard({
  icon,
  label,
  children
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <Card className='flex flex-col pb-4'>
      <SectionHeader icon={icon} label={label} />
      <div className='px-4'>{children}</div>
    </Card>
  )
}

/**
 * A value inside a {@link LandingCard} — a Taste Profile entry, a pantry item —
 * as the chat welcome and the pantry show it. No `capitalize` here, unlike the
 * real Taste Profile summary: these values are copy, already cased by the
 * translator, and capitalizing would re-case hyphenated words like "Peanut-free".
 */
export function LandingChip({ label }: { label: string }) {
  return <Badge variant='muted' labelClassName='text-xs' label={label} />
}

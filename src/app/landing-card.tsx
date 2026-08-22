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

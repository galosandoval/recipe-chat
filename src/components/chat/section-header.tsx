export function SectionHeader({
  label,
  icon,
  actionComp = null,
  description
}: {
  label: string
  icon: React.ReactNode
  actionComp?: React.ReactNode
  description?: string
}) {
  return (
    <>
      <div className='flex w-full justify-between px-4'>
        <div className='text-muted-foreground flex items-center justify-center gap-1 pt-2 pb-1'>
          {icon}
          <h2 className='text-xs font-medium tracking-wide uppercase'>
            {label}
          </h2>
        </div>
        {actionComp}
      </div>
      {description && (
        <div className='flex flex-col gap-4 px-4 pb-2'>
          <p className='text-muted-foreground text-sm'>{description}</p>
        </div>
      )}
    </>
  )
}

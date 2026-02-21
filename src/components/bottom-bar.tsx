export function BottomBar({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex w-full items-center md:rounded-md'>
      <div className='bg-secondary/55 glass-element mx-auto flex w-full max-w-2xl items-center gap-1.5 p-3 sm:mb-2 sm:rounded-lg'>
        {children}
      </div>
    </div>
  )
}

export function ParallaxContainer({
  startRef,
  endRef,
  containerRef
}: {
  startRef: React.RefObject<HTMLDivElement | null>
  endRef: React.RefObject<HTMLDivElement | null>
  containerRef: React.RefObject<HTMLDivElement | null>
}) {
  return (
    <div ref={containerRef} className='absolute inset-0 -z-50 h-svh'>
      <div className='h-svh' ref={startRef}></div>
      <div className='h-svh' ref={endRef}></div>
    </div>
  )
}

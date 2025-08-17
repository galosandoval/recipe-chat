export function ParallaxContainer({
  imageRef,
  endRef,
  containerRef
}: {
  imageRef: React.RefObject<HTMLDivElement | null>
  endRef: React.RefObject<HTMLDivElement | null>
  containerRef: React.RefObject<HTMLDivElement | null>
}) {
  return (
    <div
      ref={containerRef}
      className='absolute top-0 right-0 bottom-0 left-0 -z-50'
    >
      <div className='h-svh'></div>
      <div className='h-svh' ref={imageRef}></div>
      <div className='h-svh' ref={endRef}></div>
    </div>
  )
}

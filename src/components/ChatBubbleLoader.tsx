export const ChatBubbleLoader = () => {
  return (
    <div className='chat chat-start'>
      <div className='chat-bubble'>
        <div className='mt-2 flex items-center gap-2'>
          <span
            style={{
              width: '.8rem',
              height: '.8rem',
              backgroundColor: 'hsl(var(--nc) / var(--tw-text-opacity))',
              borderRadius: '50%',
              animationDelay: '0.0s',
              animationDuration: '1.5s'
            }}
            className='animate-pulse'
          ></span>
          <span
            style={{
              width: '.8rem',
              height: '.8rem',
              backgroundColor: 'hsl(var(--nc) / var(--tw-text-opacity))',
              borderRadius: '50%',
              animationDuration: '1.5s',
              animationDelay: '0.25s'
            }}
            className='animate-pulse'
          ></span>
          <span
            style={{
              width: '.8rem',
              height: '.8rem',
              backgroundColor: 'hsl(var(--nc) / var(--tw-text-opacity))',
              animationDuration: '1.5s',
              borderRadius: '50%',
              animationDelay: '0.5s'
            }}
            className='animate-pulse'
          ></span>
        </div>
      </div>
    </div>
  )
}

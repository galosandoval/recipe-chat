import { motion } from 'framer-motion'
import { item } from 'pages/_chat'

export const ChatBubbleLoader = () => {
  return (
    <motion.div
      variants={item}
      initial='hidden'
      animate='visible'
      className='chat chat-start'
    >
      <div className='chat-bubble bg-primary-content'>
        <div className='mt-2 flex items-center gap-2'>
          <span
            style={{
              width: '.8rem',
              height: '.8rem',
              backgroundColor: 'hsl(var(--nc) / var(--tw-text-opacity))',
              borderRadius: '50%',
              animationDelay: '0.0s',
              animationDuration: '1s'
            }}
            className='animate-pulse'
          ></span>
          <span
            style={{
              width: '.8rem',
              height: '.8rem',
              backgroundColor: 'hsl(var(--nc) / var(--tw-text-opacity))',
              borderRadius: '50%',
              animationDuration: '1s',
              animationDelay: '0.25s'
            }}
            className='animate-pulse'
          ></span>
          <span
            style={{
              width: '.8rem',
              height: '.8rem',
              backgroundColor: 'hsl(var(--nc) / var(--tw-text-opacity))',
              animationDuration: '1s',
              borderRadius: '50%',
              animationDelay: '0.5s'
            }}
            className='animate-pulse'
          ></span>
        </div>
      </div>
    </motion.div>
  )
}

export const animationOptions = {
  static: true,
  transition: {
    duration: 0.3
  },
  initial: {
    opacity: 0,
    scale: 0.95
  },
  animate: { opacity: 1, scale: 1 },
  exit: {
    opacity: 0,
    scale: 0.95
  }
} as const

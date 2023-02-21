import { Fragment } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export type TotalSteps = {
  first: Step
  second?: Step
  third?: Step
  fourth?: Step
}

export type Step = {
  key: keyof TotalSteps
  next: keyof TotalSteps | null
  prev: keyof TotalSteps | null
  component: React.ReactNode
}

export function TransitionWrapper({
  currentStep,
  steps
}: {
  steps: TotalSteps
  currentStep: Step | undefined
}) {
  const stepsArr = Object.values(steps)

  return (
    <AnimatePresence initial={false}>
      {stepsArr.map((step) => (
        <Fragment key={step.key}>
          {currentStep?.key === step.key && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.5
              }}
            >
              {step.component}
            </motion.div>
          )}
        </Fragment>
      ))}
    </AnimatePresence>
  )
}

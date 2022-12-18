import { Transition } from '@headlessui/react'

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
  steps,
  transitionSwitch,
  handleAfterLeave
}: {
  steps: TotalSteps
  currentStep: Step | undefined
  transitionSwitch: boolean
  handleAfterLeave: () => void
}) {
  const stepsArr = Object.values(steps)
  const stepsToRender = stepsArr.map((step) => {
    if (step.key === 'first') {
      return (
        <Transition
          show={currentStep?.key === step.key && transitionSwitch}
          appear={true}
          leave='transition-all duration-300'
          leaveFrom='opacity-100 translate-y-0'
          leaveTo='opacity-0 translate-y-1'
          afterLeave={handleAfterLeave}
          key={step.key}
        >
          {step.component}
        </Transition>
      )
    }
    return (
      <Transition
        show={currentStep?.key === step.key && transitionSwitch}
        enter='transition-all duration-500 '
        enterFrom='opacity-0 -translate-y-2'
        enterTo='opacity-100 translate-y-0'
        leave='transition-opacity duration-150'
        leaveFrom='opacity-100'
        leaveTo='opacity-0'
        afterLeave={handleAfterLeave}
        key={step.key}
      >
        {step.component}
      </Transition>
    )
  })

  return <>{stepsToRender}</>
}

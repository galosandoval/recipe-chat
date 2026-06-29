import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { TranslationsTestProvider, en } from '~/lib/test-translations'
import { useAppForm } from '~/hooks/use-app-form'
import {
  tasteProfileSchema,
  tasteProfileDefaults,
  type TasteProfileSchema
} from '~/schemas/taste-profile-schema'
import { StepCuisines } from './step-cuisines'

function Harness({ initial }: { initial?: Partial<TasteProfileSchema> }) {
  const form = useAppForm(tasteProfileSchema, {
    defaultValues: { ...tasteProfileDefaults, ...initial }
  })
  return (
    <TranslationsTestProvider>
      <StepCuisines form={form} />
    </TranslationsTestProvider>
  )
}

const customInput = () =>
  screen.getByLabelText(en.onboarding.cuisineCustomLabel)
const addButton = () => screen.getByRole('button', { name: en.onboarding.add })

describe('StepCuisines', () => {
  it('renders no required-selection error when nothing is selected', () => {
    render(<Harness />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.queryByText(/at least one/i)).not.toBeInTheDocument()
  })

  it('trims a custom value, adds it selected, and clears the input', () => {
    render(<Harness />)
    fireEvent.change(customInput(), { target: { value: '  Vietnamese  ' } })
    fireEvent.click(addButton())
    expect(screen.getByRole('button', { name: /vietnamese/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(customInput()).toHaveValue('')
  })

  it('adds with Enter', () => {
    render(<Harness />)
    fireEvent.change(customInput(), { target: { value: 'Cajun' } })
    fireEvent.keyDown(customInput(), { key: 'Enter' })
    expect(screen.getByRole('button', { name: /cajun/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })

  it('rejects blanks and case-insensitive duplicates', () => {
    render(<Harness />)
    fireEvent.change(customInput(), { target: { value: ' ' } })
    fireEvent.click(addButton())
    fireEvent.change(customInput(), { target: { value: 'italian' } })
    fireEvent.click(addButton())
    expect(screen.getAllByRole('button', { name: /italian/i })).toHaveLength(1)
  })
})

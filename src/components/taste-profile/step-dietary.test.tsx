import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { TranslationsTestProvider, en } from '~/lib/test-translations'
import { useAppForm } from '~/hooks/use-app-form'
import {
  tasteProfileSchema,
  tasteProfileDefaults,
  type TasteProfileSchema
} from '~/schemas/taste-profile-schema'
import { StepDietary } from './step-dietary'

function Harness({ initial }: { initial?: Partial<TasteProfileSchema> }) {
  const form = useAppForm(tasteProfileSchema, {
    defaultValues: { ...tasteProfileDefaults, ...initial }
  })
  return (
    <TranslationsTestProvider>
      <StepDietary form={form} />
    </TranslationsTestProvider>
  )
}

const customInput = () =>
  screen.getByLabelText(en.onboarding.dietaryCustomLabel)
const addButton = () => screen.getByRole('button', { name: en.onboarding.add })

describe('StepDietary', () => {
  it('renders no "None" preset', () => {
    render(<Harness />)
    expect(
      screen.queryByRole('button', { name: /^none$/i })
    ).not.toBeInTheDocument()
  })

  it('trims a custom value, adds it selected, and clears the input', () => {
    render(<Harness />)
    fireEvent.change(customInput(), { target: { value: '  pescatarian  ' } })
    fireEvent.click(addButton())
    expect(
      screen.getByRole('button', { name: /pescatarian/i })
    ).toHaveAttribute('aria-pressed', 'true')
    expect(customInput()).toHaveValue('')
  })

  it('adds with Enter', () => {
    render(<Harness />)
    fireEvent.change(customInput(), { target: { value: 'pescatarian' } })
    fireEvent.keyDown(customInput(), { key: 'Enter' })
    expect(
      screen.getByRole('button', { name: /pescatarian/i })
    ).toHaveAttribute('aria-pressed', 'true')
  })

  it('rejects blanks and case-insensitive duplicates', () => {
    render(<Harness />)
    fireEvent.change(customInput(), { target: { value: '   ' } })
    fireEvent.click(addButton())
    fireEvent.change(customInput(), { target: { value: 'VEGAN' } })
    fireEvent.click(addButton())
    expect(screen.getAllByRole('button', { name: /vegan/i })).toHaveLength(1)
  })

  it('keeps a deselected custom chip reselectable', () => {
    render(<Harness />)
    fireEvent.change(customInput(), { target: { value: 'pescatarian' } })
    fireEvent.click(addButton())
    const chip = screen.getByRole('button', { name: /pescatarian/i })
    fireEvent.click(chip) // deselect
    expect(chip).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(chip) // reselect
    expect(chip).toHaveAttribute('aria-pressed', 'true')
  })
})

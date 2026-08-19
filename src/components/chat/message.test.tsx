import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ChatMessage, stabilizePartialMarkdown } from './message'

// `message.tsx` pulls in the recipe card, which reaches next-auth and tRPC at
// import time. Neither is exercised by the bubble itself.
jest.mock('next-auth/react', () => ({
  useSession: () => ({ status: 'unauthenticated', data: null })
}))

describe('ChatMessage', () => {
  it('renders assistant content as markdown', () => {
    render(
      <ChatMessage
        content={'## Ingredients\n\n- **2 tbsp** butter'}
        icon={null}
      />
    )

    expect(
      screen.getByRole('heading', { level: 2, name: 'Ingredients' })
    ).toBeInTheDocument()
    expect(screen.getByText('2 tbsp').tagName).toBe('STRONG')
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
  })

  it('keeps single newlines as line breaks', () => {
    const { container } = render(
      <ChatMessage content={'first line\nsecond line'} icon={null} />
    )

    expect(container.querySelector('br')).toBeInTheDocument()
  })

  it('renders user content as plain text, not markdown', () => {
    render(<ChatMessage content='**not bold**' icon={null} isUserMessage />)

    expect(screen.getByText('**not bold**')).toBeInTheDocument()
    expect(document.querySelector('strong')).not.toBeInTheDocument()
  })
})

describe('stabilizePartialMarkdown', () => {
  it('leaves a complete document untouched', () => {
    const complete = '**bold** and ~~struck~~\n```\ncode\n```'

    expect(stabilizePartialMarkdown(complete)).toBe(complete)
  })

  it('closes an unterminated code fence', () => {
    expect(stabilizePartialMarkdown('```ts\nconst a = 1')).toBe(
      '```ts\nconst a = 1\n```'
    )
  })

  it('drops a half-arrived bold marker so the raw `**` never shows', () => {
    expect(stabilizePartialMarkdown('Add the **butter')).toBe('Add the butter')
  })

  it('drops a half-arrived strikethrough marker', () => {
    expect(stabilizePartialMarkdown('~~oops')).toBe('oops')
  })

  it('only drops the unmatched marker, keeping earlier pairs', () => {
    expect(stabilizePartialMarkdown('**one** then **two')).toBe(
      '**one** then two'
    )
  })
})

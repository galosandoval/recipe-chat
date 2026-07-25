import { parseStepTimers, formatCountdown } from './cook-mode-timer'

describe('parseStepTimers', () => {
  it('returns no timers when the step mentions no cooking time', () => {
    expect(parseStepTimers('Mix the flour and water together.')).toEqual([])
  })

  it('extracts a single time in minutes', () => {
    expect(parseStepTimers('Simmer for 20 minutes.')).toEqual([
      { label: '20 minutes', seconds: 20 * 60 }
    ])
  })

  it('handles the abbreviated "min" unit', () => {
    expect(parseStepTimers('Rest for 5 min before serving.')).toEqual([
      { label: '5 min', seconds: 5 * 60 }
    ])
  })

  it('converts hours to seconds', () => {
    expect(parseStepTimers('Bake for 1 hour.')).toEqual([
      { label: '1 hour', seconds: 60 * 60 }
    ])
  })

  it('converts seconds', () => {
    expect(parseStepTimers('Blanch for 30 seconds.')).toEqual([
      { label: '30 seconds', seconds: 30 }
    ])
  })

  it('uses the upper bound of a range so nothing is undercooked', () => {
    expect(parseStepTimers('Cook for 1-2 minutes, tossing.')).toEqual([
      { label: '1-2 minutes', seconds: 2 * 60 }
    ])
  })

  it('extracts multiple timers from one step in order', () => {
    expect(parseStepTimers('Saute 2 minutes, then bake 30 minutes.')).toEqual([
      { label: '2 minutes', seconds: 2 * 60 },
      { label: '30 minutes', seconds: 30 * 60 }
    ])
  })
})

describe('formatCountdown', () => {
  it('formats whole minutes and seconds as MM:SS', () => {
    expect(formatCountdown(20 * 60)).toBe('20:00')
    expect(formatCountdown(65)).toBe('01:05')
    expect(formatCountdown(9)).toBe('00:09')
  })

  it('rolls hours into the minutes field', () => {
    expect(formatCountdown(60 * 60)).toBe('60:00')
  })

  it('never shows a negative countdown', () => {
    expect(formatCountdown(-5)).toBe('00:00')
  })
})

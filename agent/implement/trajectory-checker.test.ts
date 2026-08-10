/**
 * @jest-environment node
 */
import {
  checkTrajectory,
  formatScorecard,
  INVARIANTS,
  DEFAULT_HEADROOM_FRACTION,
  type TranscriptEvent,
  type TrajectoryFinding,
  type TrajectoryInvariantId,
  type TrajectoryStatus
} from './trajectory-checker'

// --- Fixture builders: parsed transcript events, checked in beside the test ---
// Each helper emits the same shape the Claude Code session JSONL records use, so
// a fixture transcript is just an ordered array of these — clean trajectories
// and one-violation-each trajectories, pinning every invariant in both
// directions (per #566 testing decisions).

let nextTurn = 0

/** One assistant turn issuing a Bash command; returns the tool_use id. */
function bash(command: string): { events: TranscriptEvent[]; id: string } {
  nextTurn += 1
  const id = `tool_${nextTurn}`
  return {
    id,
    events: [
      {
        type: 'assistant',
        message: {
          id: `msg_${nextTurn}`,
          content: [{ type: 'tool_use', id, name: 'Bash', input: { command } }]
        }
      }
    ]
  }
}

/** The user tool_result pairing a Bash call with a pass/fail exit. */
function result(id: string, failed: boolean): TranscriptEvent {
  return {
    type: 'user',
    message: {
      content: [{ type: 'tool_result', tool_use_id: id, is_error: failed }]
    }
  }
}

/** A completed shell step: the assistant turn plus its (passing) result. */
function step(command: string): TranscriptEvent[] {
  const { events, id } = bash(command)
  return [...events, result(id, false)]
}

/** A shell step whose command failed (non-zero exit). */
function failingStep(command: string): TranscriptEvent[] {
  const { events, id } = bash(command)
  return [...events, result(id, true)]
}

const OPTIONS = { maxTurns: 150 }

beforeEach(() => {
  nextTurn = 0
})

function find(
  findings: TrajectoryFinding[],
  id: TrajectoryInvariantId
): TrajectoryFinding {
  const finding = findings.find((f) => f.id === id)
  if (!finding) throw new Error(`no finding for ${id}`)
  return finding
}

function statuses(
  findings: TrajectoryFinding[]
): Record<TrajectoryInvariantId, TrajectoryStatus> {
  return Object.fromEntries(findings.map((f) => [f.id, f.status])) as Record<
    TrajectoryInvariantId,
    TrajectoryStatus
  >
}

/** A clean trajectory: RED (failing test) → GREEN → gate → commit, no bad ops. */
function cleanTrajectory(): TranscriptEvent[] {
  return [
    ...failingStep('bun run test agent/implement/trajectory-checker.test.ts'),
    ...step('bun run typecheck'),
    ...step('bun run lint'),
    ...step('bun run format'),
    ...step('bun run test'),
    ...step('git add -A && git commit -m "feat: add trajectory checker"')
  ]
}

describe('checkTrajectory', () => {
  it('passes every invariant on a clean trajectory', () => {
    const findings = checkTrajectory(cleanTrajectory(), OPTIONS)
    expect(findings.map((f) => f.id)).toEqual(INVARIANTS.map((i) => i.id))
    for (const finding of findings) {
      expect(finding.status).toBe('pass')
    }
  })

  describe('gate-before-commit', () => {
    it('fails when a commit is not preceded by a gate run', () => {
      const events = [
        ...step('git add -A && git commit -m "chore: commit without gate"')
      ]
      const finding = find(
        checkTrajectory(events, OPTIONS),
        'gate-before-commit'
      )
      expect(finding.status).toBe('fail')
      expect(finding.evidence).toHaveLength(1)
      expect(finding.evidence[0].command).toContain('git commit')
    })

    it('requires the gate again for a second commit', () => {
      const events = [
        ...step('bun run test'),
        ...step('git commit -m "feat: first"'),
        // no gate rerun before the second commit
        ...step('git commit -m "feat: second"')
      ]
      const finding = find(
        checkTrajectory(events, OPTIONS),
        'gate-before-commit'
      )
      expect(finding.status).toBe('fail')
      expect(finding.evidence).toHaveLength(1)
      expect(finding.evidence[0].command).toContain('second')
    })

    it('passes vacuously when the run made no commits', () => {
      const events = [...step('bun run test')]
      const finding = find(
        checkTrajectory(events, OPTIONS),
        'gate-before-commit'
      )
      expect(finding.status).toBe('pass')
      expect(finding.detail).toMatch(/no commits/)
    })
  })

  describe('red-before-green', () => {
    it('fails when no failing test preceded the first commit', () => {
      const events = [
        ...step('bun run test'), // passing only — never saw RED
        ...step('git commit -m "feat: no red"')
      ]
      const finding = find(checkTrajectory(events, OPTIONS), 'red-before-green')
      expect(finding.status).toBe('fail')
    })

    it('passes when a failing test preceded the first commit', () => {
      const finding = find(
        checkTrajectory(cleanTrajectory(), OPTIONS),
        'red-before-green'
      )
      expect(finding.status).toBe('pass')
    })

    it('is not-evaluable when there is no commit', () => {
      const events = [...failingStep('bun run test')]
      const finding = find(checkTrajectory(events, OPTIONS), 'red-before-green')
      expect(finding.status).toBe('not-evaluable')
    })
  })

  describe('no-forbidden-git-ops', () => {
    it('flags a force-push', () => {
      const events = [...step('git push --force origin my-branch')]
      const finding = find(
        checkTrajectory(events, OPTIONS),
        'no-forbidden-git-ops'
      )
      expect(finding.status).toBe('fail')
      expect(finding.detail).toContain('force')
    })

    it('flags a -f force-push shorthand', () => {
      const events = [...step('git push -f origin my-branch')]
      const finding = find(
        checkTrajectory(events, OPTIONS),
        'no-forbidden-git-ops'
      )
      expect(finding.status).toBe('fail')
    })

    it('flags a commit --amend', () => {
      const events = [...step('git commit --amend -m "rewrite history"')]
      const finding = find(
        checkTrajectory(events, OPTIONS),
        'no-forbidden-git-ops'
      )
      expect(finding.status).toBe('fail')
      expect(finding.detail).toContain('amend')
    })

    it('passes on an ordinary push', () => {
      const events = [...step('git push -u origin my-branch')]
      const finding = find(
        checkTrajectory(events, OPTIONS),
        'no-forbidden-git-ops'
      )
      expect(finding.status).toBe('pass')
    })
  })

  describe('turn-budget-headroom', () => {
    it('passes with ample headroom', () => {
      const finding = find(
        checkTrajectory(cleanTrajectory(), { maxTurns: 150 }),
        'turn-budget-headroom'
      )
      expect(finding.status).toBe('pass')
      expect(finding.detail).toContain('/150 turns')
    })

    it('fails when turns reach the headroom threshold', () => {
      // 5 turns against a cap of 5 → 100% used, no headroom.
      const events = [
        ...step('a'),
        ...step('b'),
        ...step('c'),
        ...step('d'),
        ...step('e')
      ]
      const finding = find(
        checkTrajectory(events, {
          maxTurns: 5,
          headroomFraction: DEFAULT_HEADROOM_FRACTION
        }),
        'turn-budget-headroom'
      )
      expect(finding.status).toBe('fail')
    })
  })

  describe('not-evaluable transcripts', () => {
    it('grades every invariant not-evaluable for an empty transcript', () => {
      const findings = checkTrajectory([], OPTIONS)
      for (const finding of findings) {
        expect(finding.status).toBe('not-evaluable')
      }
    })

    it('grades every invariant not-evaluable for a truncated/malformed transcript', () => {
      // A record with no assistant turn — e.g. a transcript cut off mid-write.
      const findings = checkTrajectory(
        [{ type: 'summary', summary: 'truncated' }],
        OPTIONS
      )
      expect(statuses(findings)).toEqual({
        'gate-before-commit': 'not-evaluable',
        'red-before-green': 'not-evaluable',
        'no-forbidden-git-ops': 'not-evaluable',
        'turn-budget-headroom': 'not-evaluable'
      })
    })

    it('does not throw on a non-array input', () => {
      expect(() =>
        checkTrajectory(null as unknown as TranscriptEvent[], OPTIONS)
      ).not.toThrow()
    })
  })
})

describe('formatScorecard', () => {
  it('renders a terse table with one row per invariant', () => {
    const markdown = formatScorecard(
      checkTrajectory(cleanTrajectory(), OPTIONS)
    )
    expect(markdown).toContain('Trajectory scorecard')
    expect(markdown).toContain('| Invariant | Result |')
    expect(markdown).toContain('4/4 process invariants passed')
    for (const invariant of INVARIANTS) {
      expect(markdown).toContain(invariant.title)
    }
  })

  it('lists evidence turns for anything that did not pass', () => {
    const events = [...step('git add -A && git commit -m "chore: no gate"')]
    const markdown = formatScorecard(checkTrajectory(events, OPTIONS))
    expect(markdown).toContain('❌ fail')
    expect(markdown).toMatch(/turn \d+/)
  })

  it('is a pure function of its findings', () => {
    const findings = checkTrajectory(cleanTrajectory(), OPTIONS)
    expect(formatScorecard(findings)).toBe(formatScorecard(findings))
  })
})

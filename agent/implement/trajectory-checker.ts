/**
 * Deterministic trajectory checker for the `agent:implement` pipeline (#566).
 *
 * A pure module — parsed transcript events in, findings out — that grades *how*
 * an agent run worked, not just what it produced. The agent's Claude Code
 * session transcript records every tool call it made; this module asserts
 * process invariants over that record (the quality gate ran before each commit,
 * a failing test preceded the first commit, no force-push/amend, turn-budget
 * headroom) so process failures become visible even when the output happens to
 * pass. No IO here: reading and parsing the transcript file stays in the thin
 * runner (run-trajectory-check.ts) so this stays testable with fixtures.
 *
 * The invariant set is a plain data structure ({@link INVARIANTS}) — adding an
 * invariant is one entry plus fixtures. Findings are advisory by contract: the
 * runner never changes the run's exit code over them (#566, user stories 8/11).
 */

/** A single parsed record from the Claude Code session transcript (JSONL). */
export type TranscriptEvent = Record<string, unknown>

export type TrajectoryStatus = 'pass' | 'fail' | 'not-evaluable'

/** Stable ids — a month of scorecards clusters on these, so they never churn. */
export type TrajectoryInvariantId =
  | 'gate-before-commit'
  | 'red-before-green'
  | 'no-forbidden-git-ops'
  | 'turn-budget-headroom'

/** The offending turn (and command) that produced a fail — the evidence. */
export interface TrajectoryEvidence {
  /** 1-based index of the transcript turn the offending tool call belongs to. */
  turnIndex: number
  /** The offending shell command, when the evidence is a Bash call. */
  command?: string
}

export interface TrajectoryFinding {
  id: TrajectoryInvariantId
  title: string
  status: TrajectoryStatus
  /** Terse human-readable evidence line. */
  detail: string
  evidence: TrajectoryEvidence[]
}

export interface CheckTrajectoryOptions {
  /** The run-policy max-turns cap the budget headroom is measured against. */
  maxTurns: number
  /**
   * Fraction of the cap that must remain unused for the budget invariant to
   * pass. Default 0.2 — a run using ≥80% of its turns barely fit and is
   * flagged before it starts failing.
   */
  headroomFraction?: number
}

/** Default headroom: flag a run that used ≥80% of its turn cap. */
export const DEFAULT_HEADROOM_FRACTION = 0.2

// --- Command classification (deterministic, regex over the Bash command) ------

/**
 * The quality gate's culminating step (`bun run test`, which expands to
 * `bunx jest`). Its presence is the proxy for "the gate ran": it is the final
 * and most expensive gate step, so reaching it means the agent ran the gate.
 * The `(?![:\w-])` guard excludes `test:e2e` / `test:unit` (verify + partial
 * scripts), matching only the whole-suite gate run or a `bun run test <path>`.
 */
function isGateRun(command: string): boolean {
  return (
    /\bbun\s+run\s+test(?![:\w-])/.test(command) ||
    /\bbun\s+test(?![:\w-])/.test(command) ||
    /\bbunx?\s+jest\b/.test(command)
  )
}

/** A `git commit` (any form, including `--amend`). */
function isCommit(command: string): boolean {
  return /\bgit\s+commit\b/.test(command)
}

/**
 * A forbidden history rewrite: force-push or amend. Detection only — the
 * complementary preventive hooks are out of scope for #566.
 */
function forbiddenGitOp(command: string): string | null {
  if (/\bgit\s+commit\b[^\n]*--amend\b/.test(command))
    return 'git commit --amend'
  if (
    /\bgit\s+push\b/.test(command) &&
    /(--force-with-lease\b|--force\b|(^|\s)-f(\s|$))/.test(command)
  ) {
    return 'git push --force'
  }
  return null
}

// --- Normalization ------------------------------------------------------------

interface Action {
  turnIndex: number
  tool: string
  command: string | null
  toolUseId: string | null
  /** From the paired tool_result's is_error; null when unknown/unpaired. */
  failed: boolean | null
}

interface NormalizedTrajectory {
  actions: Action[]
  turnCount: number
  /** False for an empty / truncated / malformed transcript with no turns. */
  evaluable: boolean
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

function contentBlocks(
  event: Record<string, unknown>
): Record<string, unknown>[] {
  const message = asRecord(event.message)
  const content = message?.content
  if (!Array.isArray(content)) return []
  return content
    .map(asRecord)
    .filter((b): b is Record<string, unknown> => b !== null)
}

/**
 * Fold the raw transcript into an ordered action list with turn indices and
 * pass/fail results, pairing each tool_use with its tool_result via id. Never
 * throws on odd shapes — an unrecognizable record contributes nothing.
 */
function normalize(events: unknown): NormalizedTrajectory {
  if (!Array.isArray(events)) {
    return { actions: [], turnCount: 0, evaluable: false }
  }

  const resultErrors = new Map<string, boolean>()
  const rawActions: Action[] = []
  let turnCount = 0
  let lastAssistantId: unknown = Symbol('none')

  for (const raw of events) {
    const event = asRecord(raw)
    if (!event) continue

    if (event.type === 'assistant') {
      const message = asRecord(event.message)
      const id = message?.id
      // A new turn whenever the assistant message id changes (or is absent).
      if (id === undefined || id === null || id !== lastAssistantId) turnCount++
      lastAssistantId = id
      for (const block of contentBlocks(event)) {
        if (block.type !== 'tool_use') continue
        const input = asRecord(block.input) ?? {}
        const command = typeof input.command === 'string' ? input.command : null
        rawActions.push({
          turnIndex: turnCount,
          tool: typeof block.name === 'string' ? block.name : 'unknown',
          command,
          toolUseId: typeof block.id === 'string' ? block.id : null,
          failed: null
        })
      }
    } else if (event.type === 'user') {
      for (const block of contentBlocks(event)) {
        if (block.type !== 'tool_result') continue
        const id = block.tool_use_id
        if (typeof id === 'string' && typeof block.is_error === 'boolean') {
          resultErrors.set(id, block.is_error)
        }
      }
    }
  }

  for (const action of rawActions) {
    if (action.toolUseId !== null && resultErrors.has(action.toolUseId)) {
      action.failed = resultErrors.get(action.toolUseId) ?? null
    }
  }

  return { actions: rawActions, turnCount, evaluable: turnCount > 0 }
}

// --- Invariants (plain data — add one entry + fixtures to extend) -------------

interface InvariantContext {
  actions: Action[]
  turnCount: number
  options: CheckTrajectoryOptions
}

interface InvariantResult {
  status: TrajectoryStatus
  detail: string
  evidence: TrajectoryEvidence[]
}

interface InvariantDefinition {
  id: TrajectoryInvariantId
  title: string
  evaluate(ctx: InvariantContext): InvariantResult
}

export const INVARIANTS: InvariantDefinition[] = [
  {
    id: 'gate-before-commit',
    title: 'Quality gate ran before every commit',
    evaluate({ actions }) {
      let gateRan = false
      let commitCount = 0
      const offenders: TrajectoryEvidence[] = []
      for (const action of actions) {
        if (action.command === null) continue
        if (isGateRun(action.command)) gateRan = true
        if (isCommit(action.command)) {
          commitCount++
          if (!gateRan) {
            offenders.push({
              turnIndex: action.turnIndex,
              command: action.command
            })
          }
          gateRan = false
        }
      }
      if (offenders.length > 0) {
        return {
          status: 'fail',
          detail: `${offenders.length} of ${commitCount} commit(s) not preceded by a gate run`,
          evidence: offenders
        }
      }
      return {
        status: 'pass',
        detail:
          commitCount === 0
            ? 'no commits in this run'
            : `gate ran before each of ${commitCount} commit(s)`,
        evidence: []
      }
    }
  },
  {
    id: 'red-before-green',
    title: 'A failing test preceded the first commit (RED before GREEN)',
    evaluate({ actions }) {
      const firstCommit = actions.findIndex(
        (a) => a.command !== null && isCommit(a.command)
      )
      if (firstCommit === -1) {
        return {
          status: 'not-evaluable',
          detail: 'no implementation commit to evaluate',
          evidence: []
        }
      }
      const sawFailingTest = actions
        .slice(0, firstCommit)
        .some(
          (a) => a.command !== null && isGateRun(a.command) && a.failed === true
        )
      if (sawFailingTest) {
        return {
          status: 'pass',
          detail: 'a failing test run preceded the first commit',
          evidence: []
        }
      }
      const commit = actions[firstCommit]
      return {
        status: 'fail',
        detail: 'no failing test run observed before the first commit',
        evidence: [
          { turnIndex: commit.turnIndex, command: commit.command ?? undefined }
        ]
      }
    }
  },
  {
    id: 'no-forbidden-git-ops',
    title: 'No force-push or amend in the trajectory',
    evaluate({ actions }) {
      const offenders: TrajectoryEvidence[] = []
      const kinds = new Set<string>()
      for (const action of actions) {
        if (action.command === null) continue
        const op = forbiddenGitOp(action.command)
        if (op !== null) {
          kinds.add(op)
          offenders.push({
            turnIndex: action.turnIndex,
            command: action.command
          })
        }
      }
      if (offenders.length > 0) {
        return {
          status: 'fail',
          detail: `forbidden git op(s): ${[...kinds].join(', ')}`,
          evidence: offenders
        }
      }
      return { status: 'pass', detail: 'no force-push or amend', evidence: [] }
    }
  },
  {
    id: 'turn-budget-headroom',
    title: 'Turn usage within headroom of the cap',
    evaluate({ turnCount, options }) {
      const headroom = options.headroomFraction ?? DEFAULT_HEADROOM_FRACTION
      const threshold = Math.ceil(options.maxTurns * (1 - headroom))
      const detail = `${turnCount}/${options.maxTurns} turns used`
      if (turnCount >= threshold) {
        return {
          status: 'fail',
          detail: `${detail} (≥${threshold} — under ${Math.round(headroom * 100)}% headroom)`,
          evidence: []
        }
      }
      return { status: 'pass', detail, evidence: [] }
    }
  }
]

/**
 * Grade a parsed transcript against every process invariant. Pure: same events
 * in, same findings out. An empty / truncated / malformed transcript (no
 * assistant turns) grades every invariant `not-evaluable` rather than throwing.
 */
export function checkTrajectory(
  events: TranscriptEvent[] | unknown,
  options: CheckTrajectoryOptions
): TrajectoryFinding[] {
  const { actions, turnCount, evaluable } = normalize(events)
  if (!evaluable) {
    return INVARIANTS.map((invariant) => ({
      id: invariant.id,
      title: invariant.title,
      status: 'not-evaluable' as const,
      detail: 'transcript not evaluable (empty, truncated, or malformed)',
      evidence: []
    }))
  }
  const ctx: InvariantContext = { actions, turnCount, options }
  return INVARIANTS.map((invariant) => {
    const result = invariant.evaluate(ctx)
    return {
      id: invariant.id,
      title: invariant.title,
      status: result.status,
      detail: result.detail,
      evidence: result.evidence
    }
  })
}

// --- Scorecard formatting (pure: findings in, markdown out) --------------------

const STATUS_MARK: Record<TrajectoryStatus, string> = {
  pass: '✅ pass',
  fail: '❌ fail',
  'not-evaluable': '⚪ n/a'
}

/**
 * Render findings as a terse, stable markdown scorecard: a summary line, a
 * one-row-per-invariant table, then an evidence block for anything that did not
 * pass. Terse on purpose — scanning a month of PRs surfaces clustered process
 * failures at a glance.
 */
export function formatScorecard(findings: TrajectoryFinding[]): string {
  const passes = findings.filter((f) => f.status === 'pass').length
  const lines: string[] = []
  lines.push('### 🧭 Trajectory scorecard')
  lines.push('')
  lines.push(
    `${passes}/${findings.length} process invariants passed _(advisory — never blocks the PR)_.`
  )
  lines.push('')
  lines.push('| Invariant | Result |')
  lines.push('| --- | --- |')
  for (const finding of findings) {
    lines.push(`| ${finding.title} | ${STATUS_MARK[finding.status]} |`)
  }

  const notable = findings.filter((f) => f.status !== 'pass')
  if (notable.length > 0) {
    lines.push('')
    for (const finding of notable) {
      const turns = finding.evidence
        .map((e) => `turn ${e.turnIndex}`)
        .join(', ')
      const where = turns.length > 0 ? ` (${turns})` : ''
      lines.push(`- **${finding.title}** — ${finding.detail}${where}`)
    }
  }

  return lines.join('\n')
}

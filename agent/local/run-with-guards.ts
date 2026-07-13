import { spawn } from 'node:child_process'

/**
 * Local-only runaway guards for `agent:local` (#541): a wall-clock cap and an
 * idle cap on top of `implement.ts`'s own `--max-turns` cap. CI already has
 * an equivalent wall-clock via the workflow's `timeout-minutes: 45`; a local
 * run has no workflow wrapping it, so this process supervises the same two
 * failure modes (a slow-but-still-working run, and a fully stuck one)
 * itself. Not unit-tested — a thin IO/process wrapper, verified by running,
 * matching how the repo treats the rest of its agent-pipeline IO scripts.
 */

const WALL_CLOCK_MS =
  Number(process.env.LOCAL_WALL_CLOCK_MINUTES ?? '45') * 60_000
const IDLE_MS = Number(process.env.LOCAL_IDLE_MINUTES ?? '30') * 60_000
const IDLE_CHECK_INTERVAL_MS = 15_000

const child = spawn('bun', ['agent/implement/implement.ts'], {
  stdio: ['inherit', 'pipe', 'pipe']
})

let lastActivity = Date.now()

// implement.ts sets AGENT_STREAM_OUTPUT (below), which switches the CLI to
// `--output-format stream-json`: one JSON event per line instead of a single
// blob printed at the very end. Pretty-print the events worth showing;
// anything unrecognized still passes through raw rather than getting
// swallowed, so a schema drift degrades to noisier output, never to silence.
let stdoutBuffer = ''
child.stdout.on('data', (chunk: Buffer) => {
  lastActivity = Date.now()
  stdoutBuffer += chunk.toString('utf8')
  const lines = stdoutBuffer.split('\n')
  stdoutBuffer = lines.pop() ?? ''
  for (const line of lines) printStreamEvent(line)
})
child.stderr.on('data', (chunk: Buffer) => {
  process.stderr.write(chunk)
  lastActivity = Date.now()
})

function printStreamEvent(line: string) {
  if (!line.trim()) return
  try {
    const summary = summarizeStreamEvent(JSON.parse(line))
    if (summary !== null) {
      console.log(summary)
      return
    }
  } catch {
    // Not JSON — stay resilient and fall through to raw passthrough.
  }
  console.log(line)
}

/** Returns a short progress line for events worth surfacing, or `null` to
 *  stay quiet for events with nothing new to show the maintainer. */
function summarizeStreamEvent(event: any): string | null {
  if (event.type === 'system' && event.subtype === 'init') {
    return '[session started]'
  }
  if (event.type === 'stream_event') {
    const block = event.event?.content_block
    if (
      event.event?.type === 'content_block_start' &&
      block?.type === 'tool_use'
    ) {
      return `[tool] ${block.name}`
    }
    return null
  }
  if (event.type === 'result') {
    return `[result] ${event.subtype ?? ''}${event.is_error ? ' (error)' : ''}`.trim()
  }
  return null
}

let killedFor: string | null = null

function killForTimeout(kind: string, ms: number) {
  if (killedFor) return
  killedFor = kind
  console.error(
    `\nFAILED: local ${kind} guard tripped after ${Math.round(ms / 60_000)} minute(s) — killing the agent.`
  )
  child.kill('SIGKILL')
}

const wallClockTimer = setTimeout(
  () => killForTimeout('wall-clock', WALL_CLOCK_MS),
  WALL_CLOCK_MS
)
const idleInterval = setInterval(() => {
  const idleFor = Date.now() - lastActivity
  if (idleFor > IDLE_MS) killForTimeout('idle', IDLE_MS)
}, IDLE_CHECK_INTERVAL_MS)

const exitCode: number = await new Promise((resolve) => {
  child.on('close', (code) => resolve(code ?? 1))
})

clearTimeout(wallClockTimer)
clearInterval(idleInterval)

// A guard kill still exits non-zero via the child's own SIGKILL exit code,
// but make the reason unambiguous in the log regardless of that exit code.
if (killedFor) {
  console.error(`FAILED: killed by the local ${killedFor} guard.`)
}

process.exit(killedFor ? 1 : exitCode)

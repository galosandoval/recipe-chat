// Local runner for `agent:local` (#541, #556): spawns the orchestrator and
// pretty-prints its streamed events.
//
// It used to own a wall-clock guard of its own, because `runImplementAgent`
// enforced none and only CI had a ceiling (the workflow's `timeout-minutes`).
// shopfloor 0.4.0 enforces the budget in-process, honoring the same
// `LOCAL_WALL_CLOCK_MINUTES` override, so that guard was removed rather than
// left to double up: an outer `SIGKILL` on the same budget wins the race
// against the orchestrator's `SIGTERM`-then-wait, which is what lets a looping
// agent flush uncommitted work and write a failure reason. Both runaway guards
// now live in one place for both adapters, which was the point of #556.
//
// Not unit-tested — a thin IO/process wrapper, verified by running, matching
// how the repo treats the rest of its agent-pipeline IO scripts.

import { spawn } from 'node:child_process'

const child = spawn('bun', ['agent/implement/implement.ts'], {
  stdio: ['inherit', 'pipe', 'pipe']
})

// implement.ts streams the CLI as `--output-format stream-json` (#556): one
// JSON event per line instead of a single blob printed at the very end.
// Pretty-print the events worth showing; anything unrecognized still passes
// through raw rather than getting swallowed, so a schema drift degrades to
// noisier output, never to silence.
let stdoutBuffer = ''
child.stdout.on('data', (chunk: Buffer) => {
  stdoutBuffer += chunk.toString('utf8')
  const lines = stdoutBuffer.split('\n')
  stdoutBuffer = lines.pop() ?? ''
  for (const line of lines) printStreamEvent(line)
})
child.stderr.on('data', (chunk: Buffer) => {
  process.stderr.write(chunk)
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

const exitCode: number = await new Promise((resolve) => {
  child.on('close', (code) => resolve(code ?? 1))
})

// A runaway kill surfaces as the orchestrator's own non-zero exit, with the
// budget that tripped named in its failure output.
process.exit(exitCode)

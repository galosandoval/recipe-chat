/**
 * Pure invocation-assembly for the `agent:implement` pipeline's direct Claude
 * Code CLI invocation (#540 — replaces `@ai-hero/sandcastle`, which rendered
 * the prompt template and assembled the equivalent flags on our behalf). No
 * IO here — `implement.ts` reads the template file and spawns the subprocess;
 * this module only computes what to spawn with.
 */

import { MAX_TURNS, MODEL } from './run-policy'

export interface ClaudeInvocationInput {
  /** Raw contents of `prompt.md`, with `{{PLACEHOLDER}}` tokens to render. */
  promptTemplate: string
  issueNumber: string
  issueTitle: string
  branch: string
  prDescriptionFile: string
  /** Empty when a local run has no standards mount; the template's own text
   *  handles the skip, this module just substitutes the empty string. */
  standardsDir: string
  verifyReportFile: string
  screenshotsDir: string
  /** Local-only (#541): headless `--print` text output is silent until the
   *  whole session ends, which starves a local idle-timeout of any signal to
   *  watch. Switches to `stream-json` + `--verbose` so activity streams
   *  incrementally instead. Omitted/false in CI, which keeps its args
   *  byte-identical to before this option existed. */
  streamOutput?: boolean
}

export interface ClaudeInvocation {
  /** Headless Claude CLI flags, in spawn order. */
  args: string[]
  /** The rendered prompt, passed separately so callers can wire it in as the
   *  trailing positional CLI argument without guessing where in `args` a
   *  multi-KB string would land. */
  prompt: string
}

/**
 * Renders `input.promptTemplate`'s `{{PLACEHOLDER}}` tokens against `input`'s
 * named fields and assembles the headless Claude CLI argument vector.
 */
export function prepareClaudeInvocation(
  input: ClaudeInvocationInput
): ClaudeInvocation {
  const substitutions: Record<string, string> = {
    ISSUE_NUMBER: input.issueNumber,
    ISSUE_TITLE: input.issueTitle,
    BRANCH: input.branch,
    PR_DESCRIPTION_FILE: input.prDescriptionFile,
    STANDARDS_DIR: input.standardsDir,
    VERIFY_REPORT_FILE: input.verifyReportFile,
    SCREENSHOTS_DIR: input.screenshotsDir
  }

  const prompt = input.promptTemplate.replace(/\{\{(\w+)\}\}/g, (token, key) =>
    key in substitutions ? substitutions[key] : token
  )

  const args = [
    '--print',
    '--model',
    MODEL,
    '--max-turns',
    String(MAX_TURNS),
    // Safe because the containment boundary is the environment, not this
    // flag: locally the agent runs inside a Docker container with no access
    // to the host, and in CI it runs on a disposable, credential-scoped
    // ephemeral runner. Either way, a fully autonomous headless run has no
    // human present to approve tool calls, so permission prompts would just
    // hang the run.
    '--dangerously-skip-permissions'
  ]

  if (input.streamOutput) {
    args.push(
      '--output-format',
      'stream-json',
      '--verbose',
      '--include-partial-messages'
    )
  }

  return { args, prompt }
}

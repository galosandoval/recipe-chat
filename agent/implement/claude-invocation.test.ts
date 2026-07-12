/**
 * @jest-environment node
 */
import {
  prepareClaudeInvocation,
  type ClaudeInvocationInput
} from './claude-invocation'

function baseInput(
  overrides: Partial<ClaudeInvocationInput> = {}
): ClaudeInvocationInput {
  return {
    promptTemplate:
      'Implement #{{ISSUE_NUMBER}}: {{ISSUE_TITLE}} on {{BRANCH}}.\n' +
      'Standards: [{{STANDARDS_DIR}}]\n' +
      'PR: {{PR_DESCRIPTION_FILE}}\n' +
      'Verify: {{VERIFY_REPORT_FILE}}\n' +
      'Shots: {{SCREENSHOTS_DIR}}\n',
    issueNumber: '540',
    issueTitle: 'Invoke Claude CLI directly',
    branch: 'agent/issue-540-invoke-claude-cli-directly',
    prDescriptionFile: '/tmp/out/pr_description.txt',
    standardsDir: '/tmp/skills/rules',
    verifyReportFile: '/tmp/out/verify_report.md',
    screenshotsDir: '.agent/verify/issue-540',
    ...overrides
  }
}

describe('prepareClaudeInvocation', () => {
  describe('prompt rendering', () => {
    it('substitutes every placeholder with the matching input field', () => {
      const { prompt } = prepareClaudeInvocation(baseInput())

      expect(prompt).toBe(
        'Implement #540: Invoke Claude CLI directly on ' +
          'agent/issue-540-invoke-claude-cli-directly.\n' +
          'Standards: [/tmp/skills/rules]\n' +
          'PR: /tmp/out/pr_description.txt\n' +
          'Verify: /tmp/out/verify_report.md\n' +
          'Shots: .agent/verify/issue-540\n'
      )
    })

    it('renders an empty STANDARDS_DIR so the template skips the standards step', () => {
      const { prompt } = prepareClaudeInvocation(
        baseInput({ standardsDir: '' })
      )

      expect(prompt).toContain('Standards: []')
    })

    it('leaves unrecognized tokens untouched', () => {
      const { prompt } = prepareClaudeInvocation(
        baseInput({
          promptTemplate: 'Known: {{ISSUE_NUMBER}}, unknown: {{NOT_A_FIELD}}'
        })
      )

      expect(prompt).toBe('Known: 540, unknown: {{NOT_A_FIELD}}')
    })
  })

  describe('argument vector', () => {
    it('assembles the headless CLI flags in order, without embedding the prompt', () => {
      const { args } = prepareClaudeInvocation(baseInput())

      expect(args).toEqual([
        '--print',
        '--model',
        'claude-opus-4-8',
        '--max-turns',
        '150',
        '--dangerously-skip-permissions'
      ])
    })
  })
})

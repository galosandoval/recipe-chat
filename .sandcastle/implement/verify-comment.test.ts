/**
 * @jest-environment node
 */
import {
  buildVerifyComment,
  rawScreenshotUrl,
  verifyScreenshotDir,
  type VerifyCommentInput
} from './verify-comment'

const baseInput: VerifyCommentInput = {
  report: 'Verified the login flow.',
  repo: 'galosandoval/recipe-chat',
  branch: 'agent/issue-5-add-login',
  issueNumber: 5,
  screenshots: [],
  runUrl: 'https://github.com/galosandoval/recipe-chat/actions/runs/123'
}

describe('verifyScreenshotDir', () => {
  it('names the per-issue screenshots directory', () => {
    expect(verifyScreenshotDir(5)).toBe('.agent/verify/issue-5')
    expect(verifyScreenshotDir(523)).toBe('.agent/verify/issue-523')
  })
})

describe('rawScreenshotUrl', () => {
  it('builds a raw.githubusercontent.com URL for a committed path', () => {
    expect(
      rawScreenshotUrl(
        'galosandoval/recipe-chat',
        'agent/issue-5-add-login',
        '.agent/verify/issue-5/login.png'
      )
    ).toBe(
      'https://raw.githubusercontent.com/galosandoval/recipe-chat/agent/issue-5-add-login/.agent/verify/issue-5/login.png'
    )
  })

  it('percent-encodes each path segment but keeps the slashes', () => {
    expect(
      rawScreenshotUrl('o/r', 'main', '.agent/verify/issue-5/final state.png')
    ).toBe(
      'https://raw.githubusercontent.com/o/r/main/.agent/verify/issue-5/final%20state.png'
    )
  })
})

describe('buildVerifyComment', () => {
  it('includes the trimmed report and a link to the workflow run', () => {
    const comment = buildVerifyComment({
      ...baseInput,
      report: '\n  Verified the login flow.  \n'
    })
    expect(comment).toContain('Verified the login flow.')
    expect(comment).not.toMatch(/^\s/) // report leads, no leading whitespace
    expect(comment).toContain(`[workflow run](${baseInput.runUrl})`)
  })

  it('omits the screenshots section when there are none', () => {
    const comment = buildVerifyComment(baseInput)
    expect(comment).not.toContain('Screenshots')
    expect(comment).not.toContain('![')
  })

  it('renders each screenshot inline by its raw URL with a filename alt', () => {
    const comment = buildVerifyComment({
      ...baseInput,
      screenshots: [
        '.agent/verify/issue-5/login.png',
        '.agent/verify/issue-5/chat.png'
      ]
    })
    expect(comment).toContain('Screenshots')
    expect(comment).toContain(
      '![login.png](https://raw.githubusercontent.com/galosandoval/recipe-chat/agent/issue-5-add-login/.agent/verify/issue-5/login.png)'
    )
    expect(comment).toContain(
      '![chat.png](https://raw.githubusercontent.com/galosandoval/recipe-chat/agent/issue-5-add-login/.agent/verify/issue-5/chat.png)'
    )
  })
})

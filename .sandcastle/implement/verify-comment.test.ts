/**
 * @jest-environment node
 */
import { buildVerifyComment, rawUrl } from './verify-comment'

describe('rawUrl', () => {
  it('builds a raw.githubusercontent.com URL preserving path slashes', () => {
    expect(
      rawUrl('galosandoval/recipe-chat', 'main', '.agent/verify/issue-5/a.png')
    ).toBe(
      'https://raw.githubusercontent.com/galosandoval/recipe-chat/main/.agent/verify/issue-5/a.png'
    )
  })

  it('percent-encodes segments but keeps slashes (agent branch names)', () => {
    expect(
      rawUrl(
        'galosandoval/recipe-chat',
        'agent/issue-5-add thing',
        '.agent/verify/issue-5/final state.png'
      )
    ).toBe(
      'https://raw.githubusercontent.com/galosandoval/recipe-chat/agent/issue-5-add%20thing/.agent/verify/issue-5/final%20state.png'
    )
  })
})

describe('buildVerifyComment', () => {
  const base = {
    report: 'Verified the recipes flow.',
    repo: 'galosandoval/recipe-chat',
    branch: 'agent/issue-5',
    runUrl: 'https://github.com/galosandoval/recipe-chat/actions/runs/1'
  }

  it('renders each screenshot inline with a raw URL', () => {
    const body = buildVerifyComment({
      ...base,
      screenshots: ['.agent/verify/issue-5/recipes.png']
    })
    expect(body).toContain('Verified the recipes flow.')
    expect(body).toContain(
      '![recipes.png](https://raw.githubusercontent.com/galosandoval/recipe-chat/agent/issue-5/.agent/verify/issue-5/recipes.png)'
    )
    expect(body).toContain('### Screenshots')
    expect(body).toContain('[View the workflow run](')
  })

  it('omits the screenshots section when there are none (non-UI / skipped)', () => {
    const body = buildVerifyComment({ ...base, screenshots: [] })
    expect(body).toContain('Verified the recipes flow.')
    expect(body).not.toContain('### Screenshots')
    expect(body).toContain('[View the workflow run](')
  })

  it('falls back to a placeholder when the report is empty', () => {
    const body = buildVerifyComment({ ...base, report: '   ', screenshots: [] })
    expect(body).toContain('_No verify report was produced._')
  })
})

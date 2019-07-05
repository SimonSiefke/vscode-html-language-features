import { TestCase, run, createTestFile, activateExtension } from '../test-utils'
import { before } from 'mocha'

suite('benchmark: emmet-close-tag', () => {
  before(async () => {
    await createTestFile('benchmark: emmet-complete-tag.html')
    await activateExtension()
  })

  test('basic', async () => {
    const times = 15000
    const testCases: TestCase[] = [
      {
        input: `<ul>\n${'  <li></li>\n'.repeat(times)}  l|\n</ul>`,
        type: '{tab}',
        expect: `<ul>\n${'  <li></li>\n'.repeat(times + 1)}</ul>`,
        timeout: 'never',
      },
    ]
    await run(testCases)
  })
})

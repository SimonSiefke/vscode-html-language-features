import { TestCase, createTestFile, run } from '../test-utils'
import { activateExtension } from '../activateExtension'

suite('Auto Close Tag', () => {
  before(async () => {
    await createTestFile('auto-close-tag.html')
    await activateExtension()
  })

  test('basic', async () => {
    const testCases: TestCase[] = [
      {
        input: '|',
        type: '<div>',
        expect: '<div>\n  \n</div>',
      },
      {
        input: '<div>\n  |\n</div>',
        type: '<ul>',
        expect: '<div>\n  <ul>\n    \n  </ul>\n</div>',
      },
    ]
    await run(testCases)
  })
})

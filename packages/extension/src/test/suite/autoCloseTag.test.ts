import { TestCase, createTestFile, run, activateExtension } from '../test-utils'
import { before } from 'mocha'

suite('Auto Close Tag', () => {
  before(async () => {
    await createTestFile('auto-close-tag.html')
    await activateExtension()
  })

  // after(async () => {
  //   closeTestFile()
  // })

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

import { TestCase, createTestFile, run, activateExtension } from '../test-utils'
import { before } from 'mocha'

suite('Wrap Tag', () => {
  before(async () => {
    await createTestFile('wrap-tag.html')
    await activateExtension()
  })

  test('basic', async () => {
    const testCases: TestCase[] = [
      {
        input: '',
        selection: [0, 0],
        expect: '<div>\n  \n</div>',
      },
      {
        input: 'hello world',
        selection: [0, 'hello world'.length],
        expect: '<div>\n  hello world\n</div>',
      },
    ]
    await run(testCases, {
      afterCommand: 'html.wrap-selection-with-tag',
    })
  })
})

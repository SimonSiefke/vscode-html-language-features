import { doCompletionElementAutoClose } from './completionElementAutoClose'
import { addConfig } from '../../data/HTMLManager'

beforeAll(() => {
  addConfig({
    elements: {
      input: {
        selfClosing: true,
      },
      ul: {
        newline: true,
      },
    },
  })
})

test('completion-element-auto-close', () => {
  const testCases: { input: string; expected: string | undefined }[] = [
    {
      input: '<h1>|',
      expected: '<h1>$0</h1>',
    },
    {
      input: '<h1></h1>|',
      expected: undefined,
    },
    {
      input: '<input>|',
      expected: undefined,
    },
    {
      input: '<ul>|',
      expected: '<ul>\n\t$0\n</ul>',
    },
    {
      input: '<Daten>|',
      expected: '<Daten>$0</Daten>',
    },
    {
      input: '<DatenSätze>|',
      expected: '<DatenSätze>$0</DatenSätze>',
    },
    {
      input: '<🚀>|',
      expected: undefined,
    },
  ]

  for (const testCase of testCases) {
    const offset = testCase.input.indexOf('|')
    expect(offset).toBeGreaterThan(-1)
    const text = testCase.input.replace('|', '')
    const result = doCompletionElementAutoClose(text, offset)
    if (testCase.expected === undefined) {
      expect(result).toBe(undefined)
    } else {
      expect(result).toBeDefined()
      expect(text + (result && result.completionString)).toBe(testCase.expected)
    }
  }
})

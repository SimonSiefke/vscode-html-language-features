import { doCompletionElementExpand } from './completionElementExpand'
import { addConfig } from '../../data/HTMLManager'

// TODO

beforeAll(() => {
  addConfig({
    elements: {
      h1: {},
      ul: {
        newline: true,
      },
      input: {
        selfClosing: true,
      },
      Daten: {},
      DatenSätze: {},
    },
  })
})

test('completion-element-expand', () => {
  const testCases = [
    {
      input: 'h1|',
      expected: '<h1>$0</h1>',
    },
    {
      input: 'ul|',
      expected: '<ul>\n\t$0\n</ul>',
    },
    {
      input: 'input|',
      expected: '<input>',
    },
    {
      input: 'Daten|',
      expected: '<Daten>$0</Daten>',
    },
    {
      input: 'DatenSätze|',
      expected: '<DatenSätze>$0</DatenSätze>',
    },
    {
      input: '🚀|',
      expected: undefined,
    },
  ]

  for (const testCase of testCases) {
    const offset = testCase.input.indexOf('|')
    expect(offset).toBeGreaterThan(-1)
    const text = testCase.input.replace('|', '')
    const result = doCompletionElementExpand(text, offset)
    if (testCase.expected === undefined) {
      expect(result).toBe(undefined)
    } else {
      expect(result).toBeDefined()
      expect(
        text.slice(0, result && result.completionOffset) +
          (result && result.completionString)
      ).toBe(testCase.expected)
    }
  }
})

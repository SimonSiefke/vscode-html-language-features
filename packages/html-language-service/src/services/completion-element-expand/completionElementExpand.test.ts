import { doCompletionElementExpand } from './completionElementExpand'
import { setConfig } from '../../data/Data'

// TODO

beforeAll(() => {
  setConfig({
    elements: {
      div: {
        newline: true,
      },
      h1: {},
      ul: {
        newline: true,
      },
      input: {
        selfClosing: true,
      },
      Daten: {},
      DatenSätze: {},
      option: {},
      select: {
        allowedChildren: {
          option: {
            probability: 1,
          },
        },
      },
    },
  })
})

test('completion-element-expand', () => {
  const testCases: { input: string; expected: string | undefined }[] = [
    {
      input: 'div |',
      expected: undefined,
    },
    {
      input: 'div div|',
      expected: 'div <div>\n\t$0\n</div>',
    },
    {
      input: '<!-- -->|',
      expected: undefined,
    },
    {
      input: '<!-- -->div|',
      expected: '<!-- --><div>\n\t$0\n</div>',
    },
    {
      input: '<!-- -->div|<!-- -->',
      expected: '<!-- --><div>\n\t$0\n</div><!-- -->',
    },
    {
      input: '<!-- --> div|',
      expected: '<!-- --> <div>\n\t$0\n</div>',
    },
    // TODO
    // {
    //   input: '<!--  --> di|v <!--  -->',
    //   expected: undefined,
    // },
    {
      input: 'div|',
      expected: '<div>\n\t$0\n</div>',
    },
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
    {
      input: `<select>
        <option>op|
      </select>`,
      expected: undefined,
    },
    {
      input: `<select>
        <option></option>
        op|`,
      expected: `<select>
        <option></option>
        <option>$0</option>`,
    },
    {
      input: `<select>
  op|`,
      expected: `<select>
  <option>$0</option>`,
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
      const finalResult =
        text.slice(0, result && result.completionOffset) +
        (result && result.completionString) +
        text.slice(offset)
      expect(finalResult).toBe(testCase.expected)
    }
  }
})

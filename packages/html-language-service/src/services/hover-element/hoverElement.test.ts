import { doHoverElement } from './hoverElement'

// TODO more tests

jest.mock('../../data/HTMLManager.ts', () => ({
  getHTMLTags: () => {
    return {
      h1: {
        description: 'top level heading',
      },
      Daten: {
        description: 'Daten',
      },
      DatenSätze: {
        description: 'DatenSätze',
      },
    }
  },
}))

test('hover-element', () => {
  const testCases: { input: string; expected: any | undefined }[] = [
    {
      input: '<|',
      expected: undefined,
    },
    {
      input: `<\n\n|`,
      expected: undefined,
    },
    {
      input: '<h1|',
      expected: { content: 'top level heading', startOffset: 1, endOffset: 3 },
    },
    {
      input: '<h1 |',
      expected: undefined,
    },
    {
      input: '<h1 class="big" |',
      expected: undefined,
    },
    {
      input: `<h1 class="big"\n  |`,
      expected: undefined,
    },
    {
      input: `<h1>\n|`,
      expected: undefined,
    },
    {
      input: '<h1><|',
      expected: undefined,
    },
    {
      input: '<h1/|',
      expected: undefined,
    },
    {
      input: '<h1>|',
      expected: undefined,
    },
    {
      input: '<h1></|',
      expected: undefined,
    },
    {
      input: '<h1></h1>|',
      expected: undefined,
    },
    {
      input: '<h2></h2><h1|',
      expected: {
        content: 'top level heading',
        startOffset: 10,
        endOffset: 12,
      },
    },
    {
      input: '<Dat|en/>',
      expected: {
        content: 'Daten',
        startOffset: 1,
        endOffset: 6,
      },
    },
    {
      input: '<DatenSä|tze/>',
      expected: {
        content: 'DatenSätze',
        startOffset: 1,
        endOffset: 11,
      },
    },
    {
      input: '<🚀|',
      expected: undefined,
    },
  ]
  for (const testCase of testCases) {
    const offset = testCase.input.indexOf('|')
    expect(offset).toBeGreaterThan(-1)
    const text = testCase.input.replace('|', '')
    const result = doHoverElement(text, offset)
    expect(result).toEqual(testCase.expected)
  }
})

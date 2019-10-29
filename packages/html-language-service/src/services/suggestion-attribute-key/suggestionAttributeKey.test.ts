import { doSuggestionAttributeKey } from './suggestionAttributeKey'

jest.mock('../../data/HTMLManager.ts', () => ({
  getAttributes: (tagName: string) => {
    if (tagName === 'h1') {
      return {
        class: {},
      }
    }
    return undefined
  },
}))

test('suggestion-attribute-key', () => {
  const testCases: { input: string; expected: any | undefined }[] = [
    {
      input: '<|',
      expected: undefined,
    },
    {
      input: `<


      |`,
      expected: undefined,
    },
    {
      input: '<h1|',
      expected: undefined,
    },
    {
      input: '<h1 |',
      expected: [{ name: 'class' }],
    },
    {
      input: '<h1 class="big" |',
      expected: [{ name: 'class' }],
    },
    {
      input: `<h1 class="big"\n  |`,
      expected: [{ name: 'class' }],
    },
    {
      input: '<h1>|',
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
      input: '<h1></|',
      expected: undefined,
    },
    {
      input: '<h1></h1>|',
      expected: undefined,
    },
    {
      input: '<h1></h1><h1 |',
      expected: [{ name: 'class' }],
    },
    {
      input: '<Daten/|',
      expected: undefined,
    },
    {
      input: '<DatenSätze/|',
      expected: undefined,
    },
    {
      input: '<🚀/|',
      expected: undefined,
    },
  ]
  for (const testCase of testCases) {
    const offset = testCase.input.indexOf('|')
    expect(offset).toBeGreaterThan(-1)
    const text = testCase.input.replace('|', '')
    const result = doSuggestionAttributeKey(text, offset)
    expect(result).toEqual(testCase.expected)
  }
})

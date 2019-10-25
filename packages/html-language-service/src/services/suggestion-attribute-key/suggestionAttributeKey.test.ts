import { doSuggestionAttributeKey } from './suggestionAttributeKey'

jest.mock('html-intellicode', () => ({
  statisticsForAttributes: {
    h1: [
      {
        name: 'class',
        probability: 1,
      },
    ],
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
      expected: [{ name: 'class', probability: 1 }],
    },
    {
      input: '<h1 class="big" |',
      expected: [{ name: 'class', probability: 1 }],
    },
    {
      input: `<h1 class="big"
                  |`,
      expected: [{ name: 'class', probability: 1 }],
    },
    {
      input: '<h1>|',
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

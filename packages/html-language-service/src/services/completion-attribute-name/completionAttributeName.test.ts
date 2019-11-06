import { setConfigs } from '../../Data/Data'
import { doCompletionAttributeName } from './completionAttributeName'

test('completion-attribute-name', () => {
  setConfigs({
    tags: {
      h1: {
        attributes: {
          class: {},
        },
      },
    },
  })
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
      expected: { tagName: 'h1', attributes: ['class'] },
    },
    {
      input: '<h1 class="big" |',
      expected: { tagName: 'h1', attributes: ['class'] },
    },
    {
      input: `<h1 class="big"\n  |`,
      expected: { tagName: 'h1', attributes: ['class'] },
    },
    {
      input: '<h1 x="y"|',
      expected: undefined,
    },
    {
      input: '<h1 x=y|',
      expected: undefined,
    },
    // {
    //   input: '<h1 disabled|',
    //   expected: undefined,
    // },
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
      expected: { tagName: 'h1', attributes: ['class'] },
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
    const result = doCompletionAttributeName(text, offset)
    expect(result).toEqual(testCase.expected)
  }
})

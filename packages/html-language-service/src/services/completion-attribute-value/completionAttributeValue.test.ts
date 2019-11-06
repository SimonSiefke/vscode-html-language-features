import { setConfigs } from '../../Data/Data'
import { doCompletionAttributeValue } from './completionAttributeValue'

test('suggestion-attribute-value with attribute values', () => {
  setConfigs({
    tags: {
      a: {
        attributes: {
          rel: {
            options: {
              'noopener noreferrer': {},
            },
          },
          target: {
            options: {
              _blank: {},
            },
          },
        },
      },
    },
  })
  const testCases: { input: string; expected: any | undefined }[] = [
    {
      input: '<a target="|"',
      expected: {
        tagName: 'a',
        attributeName: 'target',
        attributeValues: [
          {
            name: '_blank',
          },
        ],
      },
    },
    {
      input: '<a target="_blank" rel="|"',
      expected: {
        tagName: 'a',
        attributeName: 'rel',
        attributeValues: [
          {
            name: 'noopener noreferrer',
          },
        ],
      },
    },
    // {
    //   input: '<|',
    //   expected: undefined,
    // },
    // {
    //   input: `<

    //   |`,
    //   expected: undefined,
    // },
    // {
    //   input: '<h1|',
    //   expected: undefined,
    // },
    // {
    //   input: '<h1 |',
    //   expected: { tagName: 'h1', attributes: [{ name: 'class' }] },
    // },
    // {
    //   input: '<h1 class="big" |',
    //   expected: { tagName: 'h1', attributes: [{ name: 'class' }] },
    // },
    // {
    //   input: `<h1 class="big"\n  |`,
    //   expected: { tagName: 'h1', attributes: [{ name: 'class' }] },
    // },
    // {
    //   input: '<h1 x="y"|',
    //   expected: undefined,
    // },
    // {
    //   input: '<h1 x=y|',
    //   expected: undefined,
    // },
    // // {
    // //   input: '<h1 disabled|',
    // //   expected: undefined,
    // // },
    // {
    //   input: '<h1>|',
    //   expected: undefined,
    // },
    // {
    //   input: `<h1>\n|`,
    //   expected: undefined,
    // },
    // {
    //   input: '<h1><|',
    //   expected: undefined,
    // },
    // {
    //   input: '<h1/|',
    //   expected: undefined,
    // },
    // {
    //   input: '<h1></|',
    //   expected: undefined,
    // },
    // {
    //   input: '<h1></h1>|',
    //   expected: undefined,
    // },
    // {
    //   input: '<h1></h1><h1 |',
    //   expected: { tagName: 'h1', attributes: [{ name: 'class' }] },
    // },
    // {
    //   input: '<Daten/|',
    //   expected: undefined,
    // },
    // {
    //   input: '<DatenSätze/|',
    //   expected: undefined,
    // },
    // {
    //   input: '<🚀/|',
    //   expected: undefined,
    // },
  ]
  for (const testCase of testCases) {
    const offset = testCase.input.indexOf('|')
    expect(offset).toBeGreaterThan(-1)
    const text = testCase.input.replace('|', '')
    const result = doCompletionAttributeValue(text, offset)
    expect(result).toEqual(testCase.expected)
  }
})

test('suggestion-attribute-value with attribute type', () => {
  setConfigs({
    tags: {
      button: {
        attributes: {
          disabled: {
            type: 'boolean',
          },
        },
      },
    },
  })
  const testCases: { input: string; expected: any | undefined }[] = [
    {
      input: '<button disabled="|"',
      expected: {
        tagName: 'button',
        attributeName: 'disabled',
        attributeType: 'boolean',
      },
    },
  ]
  for (const testCase of testCases) {
    const offset = testCase.input.indexOf('|')
    expect(offset).toBeGreaterThan(-1)
    const text = testCase.input.replace('|', '')
    const result = doCompletionAttributeValue(text, offset)
    expect(result).toEqual(testCase.expected)
  }
})

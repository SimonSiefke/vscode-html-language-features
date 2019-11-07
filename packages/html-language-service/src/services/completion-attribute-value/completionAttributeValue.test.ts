import { doCompletionAttributeValue } from './completionAttributeValue'
import { replaceConfigs, resetConfigs } from '../../Data/Data'

test('completion-attribute-value with attribute values', async () => {
  await replaceConfigs(
    [
      {
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
      },
    ],
    'test'
  )
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
  ]
  for (const testCase of testCases) {
    const offset = testCase.input.indexOf('|')
    expect(offset).toBeGreaterThan(-1)
    const text = testCase.input.replace('|', '')
    const result = doCompletionAttributeValue(text, offset)
    expect(result).toEqual(testCase.expected)
  }
})

test('suggestion-attribute-value with attribute type', async () => {
  await replaceConfigs(
    [
      {
        tags: {
          button: {
            attributes: {
              disabled: {
                type: 'boolean',
              },
            },
          },
        },
      },
    ],
    'test'
  )
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

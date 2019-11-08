import { fuzzySearch } from './fuzzySearch'

const getMatches: (
  partialAttributeName: string,
  attributeName: string,
  attributeValues: string[]
) => string[] = (partialAttributeName, attributeName, attributeValues) => {
  const result = fuzzySearch(
    partialAttributeName,
    attributeName,
    attributeValues
  )
  const sortedAttributeValues = attributeValues.slice().sort((a, b) => {
    const indexA = attributeValues.indexOf(a)
    const indexB = attributeValues.indexOf(b)
    const scoreA = result.attributeValueScores[indexA]
    const scoreB = result.attributeValueScores[indexB]
    return scoreB - scoreA
  })
  return sortedAttributeValues
}

const createMatcher: (
  attributeName: string,
  attributeValues: string[]
) => (partialAttributeName: string) => string[] = (
  attributeName,
  attributeValues
) => partialAttributeName =>
  getMatches(partialAttributeName, attributeName, attributeValues)

test('input types', () => {
  const inputTypes = [
    'button',
    'checkbox',
    'color',
    'date',
    'datetime-local',
    'email',
    'file',
    'hidden',
    'image',
    'month',
    'number',
    'password',
    'radio',
    'range',
    'reset',
    'search',
    'submit',
    'tel',
    'text',
    'time',
    'url',
    'week',
  ]
  const testCases: { input: string; expect: string[]; skip?: boolean }[] = [
    {
      input: 'tdl',
      expect: ['datetime-local'],
    },
    {
      input: 'tt',
      expect: ['tel', 'text'],
    },
    {
      input: 'tr',
      expect: ['radio', 'range'],
    },
    {
      input: 'ti',
      expect: ['image'],
    },
    {
      input: 'tti',
      expect: ['time'],
      skip: true,
    },
    {
      input: 'tb',
      expect: ['button'],
    },
    {
      input: 'tyf',
      expect: ['file'],
    },
    {
      input: 'tsbmit',
      expect: ['submit'],
      skip: true,
    },
    {
      input: 'ts',
      expect: ['search', 'submit'],
    },
    {
      input: 'tim',
      expect: ['image'],
    },
    {
      input: 'time',
      expect: ['time'],
      skip: true,
    },
  ]
  const matcher = createMatcher('type', inputTypes)
  for (const testCase of testCases) {
    if (testCase.skip) {
      continue
    }
    expect(matcher(testCase.input).slice(0, testCase.expect.length)).toEqual(
      testCase.expect
    )
  }
})

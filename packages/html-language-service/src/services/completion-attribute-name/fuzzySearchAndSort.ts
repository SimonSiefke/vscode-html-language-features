import { fuzzySearch } from './fuzzySearch'

export const fuzzySearchAndSort: (
  partialAttributeName: string,
  attributeName: string,
  attributeValues: string[]
) => {
  attributeOnlyScore: number
  attributeValueScores?: { value: string; score: number }[]
} = (partialAttributeName, attributeName, attributeValues) => {
  const result = fuzzySearch(
    partialAttributeName,
    attributeName,
    attributeValues
  )
  if (!result.attributeValueScores) {
    return {
      attributeOnlyScore: result.attributeOnlyScore,
    }
  }
  const sortedAttributeValues = attributeValues
    .map((attributeValue, index) => {
      return {
        value: attributeValue,
        score: result.attributeValueScores[index],
      }
    })
    .filter(x => x.score > 0.9)
    .sort((a, b) => b.score - a.score)
  return {
    attributeOnlyScore: result.attributeOnlyScore,
    attributeValueScores: sortedAttributeValues,
  }
}

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

// const result = fuzzySearch('time', 'type', inputTypes)
// fuzzySearchAndSort('t', 'type', inputTypes) //?

fuzzySearchAndSort('d', 'data', []) //?

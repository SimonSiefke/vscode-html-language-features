import {
  createScanner,
  ScannerState,
} from '@html-language-features/html-parser'
import {
  getSuggestedAttributes,
  getSuggestedAttributeValues,
} from '../../Data/Data'
import { fuzzySearch } from './fuzzySearch'
import { fuzzySearchAndSort } from './fuzzySearchAndSort'

/**
 * Suggestions for attribute names
 * @example
 * doCompletionAttributeName(`<option `, 8) // { tagName:'option', attributes: [{ name: 'value', probability: 0.92}]}
 */
export const doCompletionAttributeName: (
  text: string,
  offset: number
) =>
  | {
      tagName: string
      attributes: {
        name: string
        attributeValueScores?: { value: string; score: number }[]
        attributeOnlyScore: number
      }[]
    }
  | undefined = (text, offset) => {
  const scanner = createScanner(text, { initialOffset: offset })
  const endsWithAttributeValue = scanner.stream.currentlyEndsWithRegex(
    /\S+=\S+$/
  )
  if (endsWithAttributeValue) {
    return undefined
  }
  const isSomewhereInStartingTag = scanner.stream.currentlyEndsWithRegex(
    /<[\S]+\s+[\s\S]*$/
  )
  if (!isSomewhereInStartingTag) {
    return undefined
  }
  const partialAttributeNameMatch = scanner.stream
    .getSource()
    .slice(0, offset)
    .match(/([a-zA-Z0-9]*)?$/)
  const partialAttributeName =
    (partialAttributeNameMatch && partialAttributeNameMatch[1]) || ''
  scanner.stream.goBackToUntilEitherChar('<', '>')
  const char = scanner.stream.peekLeft()
  if (char === '>') {
    return undefined
  }
  scanner.state = ScannerState.AfterOpeningStartTag
  scanner.scan()
  const tagName = scanner.getTokenText()

  if (!tagName) {
    return undefined
  }
  // TODO
  // 1. import statistics
  // 2. fuzzy search in statistics[tagName][inCompleteAttributeName]

  const attributes = getSuggestedAttributes(tagName)
  const attributesWithScores = attributes
    .map(attributeName => {
      const attributeValues = getSuggestedAttributeValues(
        tagName,
        attributeName
      )
      const result = fuzzySearchAndSort(
        partialAttributeName,
        attributeName,
        attributeValues
      )
      // console.log(attributeName)
      // console.log(JSON.stringify(result))
      return {
        name: attributeName,
        ...result,
      }
    })
    .filter(x => x.attributeOnlyScore > 0)
  // console.log(JSON.stringify(attributesWithScores))
  // console.log(JSON.stringify(attributes))
  if (attributesWithScores.length === 0) {
    return undefined
  }
  return {
    attributes: attributesWithScores,
    tagName,
  }
}

// setConfig({
//   elements: {
//     h1: {
//       attributes: {
//         class: {},
//       },
//     },
//   },
// })

// console.log('ok')
// doSuggestionAttributeKey('<h1 > ', 3) //?

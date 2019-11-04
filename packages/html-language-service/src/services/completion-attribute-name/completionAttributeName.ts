import {
  createScanner,
  ScannerState,
} from '@html-language-features/html-parser'
import { getSuggestedAttributes, NamedAttribute } from '../../Data/Data'

/**
 * Suggestions for attribute names
 * @example
 * doCompletionAttributeName(`<option `, 8) // { tagName:'option', attributes: [{ name: 'value', probability: 0.92}]}
 */
export const doCompletionAttributeName: (
  text: string,
  offset: number
) => { tagName: string; attributes: NamedAttribute[] } | undefined = (
  text,
  offset
) => {
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
  if (!attributes) {
    return undefined
  }
  return {
    attributes,
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

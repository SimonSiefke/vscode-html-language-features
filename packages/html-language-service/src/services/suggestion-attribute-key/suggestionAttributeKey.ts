import {
  createScanner,
  ScannerState,
} from '@html-language-features/html-parser'
import { getSuggestedAttributes, setConfig } from '../../data/Data'

/**
 * Completion for expanding tag
 *`sp` -> `<span></span>`.
 */
export const doSuggestionAttributeKey: (
  text: string,
  offset: number
) =>
  | {
      tagName?: string
      attributes: {
        name: string
        probability?: number
        deprecated?: boolean
        description?: string
      }[]
    }
  | undefined = (text, offset) => {
  const scanner = createScanner(text)
  scanner.stream.goTo(offset)

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

  const suggestedAttributes = getSuggestedAttributes(tagName)
  if (!suggestedAttributes) {
    return undefined
  }
  return {
    tagName,
    attributes: suggestedAttributes,
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

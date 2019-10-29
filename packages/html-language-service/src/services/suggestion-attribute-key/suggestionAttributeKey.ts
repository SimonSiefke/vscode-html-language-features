import {
  createScanner,
  ScannerState,
} from '@html-language-features/html-parser'
import { statisticsForAttributes } from '@html-language-features/html-intellicode'
import { getAttributes } from '../../data/HTMLManager'

const mostLikelyAttributeName: (
  tagName: string
) =>
  | { name: string; probability?: number; description: string | undefined }[]
  | undefined = tagName => {
  const attributes = getAttributes(tagName)
  if (!attributes) {
    return undefined
  }
  return Object.entries(attributes).map(([key, value]) => ({
    name: key,
    deprecated: value.deprecated,
    description: value.description,
  }))
  // statisticsForAttributes[tagName]
}
/**
 * Completion for expanding tag
 *`sp` -> `<span></span>`.
 */
export const doSuggestionAttributeKey: (
  text: string,
  offset: number
) =>
  | {
      probability?: number
      name: string
      deprecated?: boolean
      description: string | undefined
    }[]
  | undefined = (text, offset) => {
  const scanner = createScanner(text)
  scanner.stream.goTo(offset)
  if (!scanner.stream.currentlyEndsWithRegex(/<[\S]+\s+[\s\S]*$/)) {
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

  return mostLikelyAttributeName(tagName)
}

doSuggestionAttributeKey('<h1 > ', 4) //?

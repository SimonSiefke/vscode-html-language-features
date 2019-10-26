import {
  createScanner,
  ScannerState,
} from '@html-language-features/html-parser'
import { statisticsForAttributes } from '@html-language-features/html-intellicode'

/**
 * Completion for expanding tag
 *`sp` -> `<span></span>`.
 */
export const doSuggestionAttributeKey: (
  text: string,
  offset: number
) => { probability: number; name: string }[] | undefined = (text, offset) => {
  const scanner = createScanner(text)
  scanner.stream.goTo(offset)
  if (!scanner.stream.currentlyEndsWithRegex(/<[\S]+\s+[\s\S]*$/)) {
    return undefined
  }
  scanner.stream.goBackToUntilChar('<')
  scanner.state = ScannerState.AfterOpeningStartTag
  scanner.scan()
  const tagName = scanner.getTokenText()

  if (!tagName) {
    return undefined
  }
  // TODO
  // 1. import statistics
  // 2. fuzzy search in statistics[tagName][inCompleteAttributeName]

  return statisticsForAttributes[tagName]
}

doSuggestionAttributeKey('<h1 ', '<h1'.length) //?

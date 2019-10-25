import { createScanner, ScannerState, TokenType } from 'html-parser'
import { getPreviousOpeningTagName } from '../util/getParentTagName'
import { statisticsForAttributes } from 'html-intellicode'

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
  // if (!scanner.stream.currentlyEndsWithRegex(/<[\S]*\s+$/)) {
  //   return []
  // }
  scanner.stream.goBackToUntilChar('<')
  scanner.state = ScannerState.AfterOpeningStartTag
  scanner.scan()
  console.log('tagname')
  const tagName = scanner.getTokenText()

  console.log(tagName)
  console.log(Object.keys(statisticsForAttributes).length)
  console.log(typeof statisticsForAttributes)
  console.log(JSON.stringify(statisticsForAttributes))

  // TODO
  // 1. import statistics
  // 2. fuzzy search in statistics[tagName][inCompleteAttributeName]

  return statisticsForAttributes[tagName]
}

doSuggestionAttributeKey('<h1 ', '<h1'.length) //?

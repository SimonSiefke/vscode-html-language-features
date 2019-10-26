import { createScanner } from '@html-language-features/html-parser'
import { statisticsForTags } from '@html-language-features/html-intellicode'

import { getPreviousOpeningTagName } from '../util/getParentTagName'

/**
 * Completion for expanding tag
 *`sp` -> `<span></span>`.
 */
export const doSuggestionElementStartTag: (
  text: string,
  offset: number
) => { probability: number; name: string }[] | undefined = (text, offset) => {
  const scanner = createScanner(text)
  scanner.stream.goTo(offset)
  if (!scanner.stream.currentlyEndsWithRegex(/<[\S]*$/)) {
    return undefined
  }
  const completionOffset = offset
  // const currentPosition = scanner.stream.position
  // scanner.stream.goBackToUntilChar('\n')
  // const startOfLine = scanner.stream.position
  // scanner.stream.goTo(currentPosition)
  // const tagNameRE = /[\S]/
  // while (
  //   scanner.stream.position >= startOfLine &&
  //   tagNameRE.test(scanner.stream.peekLeft())
  // ) {
  //   scanner.stream.position--
  // }
  // scanner.stream.position++
  // const completionOffset = scanner.stream.position
  // scanner.state = ScannerState.WithinContent
  // scanner.scan()
  const incompleteTagName = scanner.getTokenText()
  const parent = getPreviousOpeningTagName(scanner, completionOffset - 2)
  let tagName: string | undefined

  if (parent && !parent.seenRightAngleBracket) {
    return undefined
  }

  console.log('parent is' + parent)
  const parentTagName = (parent && parent.tagName) || 'root'
  const suggestions = statisticsForTags[parentTagName]

  console.log(JSON.stringify(suggestions))
  return suggestions
}

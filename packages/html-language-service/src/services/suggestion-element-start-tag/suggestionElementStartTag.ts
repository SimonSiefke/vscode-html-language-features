import { createScanner } from '@html-language-features/html-parser'
import { getPreviousOpeningTagName } from '../util/getParentTagName'
import { getSuggestedTags, NamedSubTag } from '../../data/Data'

/**
 * Suggestion for start tag
 *`<` -> suggest `<div`, `<button` etc.
 */
export const doSuggestionElementStartTag: (
  text: string,
  offset: number
) => NamedSubTag[] | undefined = (text, offset) => {
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

  const parentTagName = (parent && parent.tagName) || 'root'
  const suggestions = getSuggestedTags(parentTagName)

  return suggestions
}

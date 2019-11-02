import { createScanner } from '@html-language-features/html-parser'
import { getSuggestedTags, NamedTag } from '../../Data/Data'
import { getPreviousOpeningTagName } from '../util/getParentTagName'

/**
 * Suggestion for start tag
 * @example
 * doSuggestionElementStartTag(`<ul><`, 5) // [{ name: 'li' }]
 */
export const doSuggestionElementStartTag: (
  text: string,
  offset: number
) => NamedTag[] | undefined = (text, offset) => {
  const scanner = createScanner(text, {
    initialOffset: offset,
  })
  if (!scanner.stream.currentlyEndsWith('<')) {
    return undefined
  }
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

  console.log('suggest start tag')
  const incompleteTagName = scanner.getTokenText()
  const parent = getPreviousOpeningTagName(scanner, completionOffset - 2)
  let tagName: string | undefined

  if (parent && !parent.seenRightAngleBracket) {
    return undefined
  }

  const parentTagName = (parent && parent.tagName) || 'root'
  console.log('parent is' + parent.tagName)

  const suggestions = getSuggestedTags(parentTagName)
  // console.log('sug')
  // console.log('a' + JSON.stringify(suggestions))
  return suggestions
}

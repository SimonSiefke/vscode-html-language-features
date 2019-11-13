import {
  createScanner,
  ScannerState,
} from '@html-language-features/html-parser'

import { getPreviousOpeningTagName } from '../util/getParentTagName'
import { getNextClosingTagName } from '../util/getNextClosingTagName'

// TODO: bug inside comment
//
//  <h1>
//         hello world

//         <!-- <h1 -->
//       </h1>
export const doAutoCompletionElementRenameTag: (
  text: string,
  offset: number
) =>
  | {
      startOffset: number
      endOffset: number
      word: string
    }
  | undefined = (text, offset) => {
  const scanner = createScanner(text)
  scanner.stream.goTo(offset)
  // console.log(scanner.stream.position)
  // console.log(scanner.stream.previousChars(3))
  // console.log(scanner.stream.peekRight())
  // scanner.stream.goBack(1)
  const atStartTag = scanner.stream.currentlyEndsWithRegex(/<[!a-zA-Z\d-]*$/)
  const atEndTag = scanner.stream.currentlyEndsWithRegex(/<\/[!a-zA-Z\d-]*$/)
  if (!atStartTag && !atEndTag) {
    return undefined
  }
  if (atEndTag) {
    const currentPosition = scanner.stream.position
    scanner.stream.goBackToUntilChar('/')
    scanner.state = ScannerState.AfterOpeningEndTag
    scanner.scan()
    const tagName = scanner.getTokenText()
    scanner.stream.goTo(currentPosition)
    scanner.stream.goBackToUntilChar('<')
    const parent = getPreviousOpeningTagName(
      scanner,
      scanner.stream.position - 2
    )
    if (!parent) {
      return undefined
    }
    if (parent.tagName === tagName) {
      return undefined
    }
    const startOffset = parent.offset
    const endOffset = parent.offset + parent.tagName.length
    const word = tagName
    return {
      startOffset,
      endOffset,
      word,
    }
  } else {
    scanner.stream.goBackToUntilChar('<')
    scanner.state = ScannerState.AfterOpeningStartTag
    scanner.scan()
    const tagName = scanner.getTokenText()
    scanner.stream.advanceUntilEitherChar('<', '>')
    const char = scanner.stream.peekRight()
    if (char === '<') {
      return undefined
    }
    scanner.stream.advanceUntilChar('>')
    scanner.stream.advance(1)
    const nextClosingTag = getNextClosingTagName(
      scanner,
      scanner.stream.position
    )
    if (!nextClosingTag) {
      return undefined
    }
    if (nextClosingTag.tagName === tagName) {
      return undefined
    }
    const startOffset = nextClosingTag.offset
    const endOffset = nextClosingTag.offset + nextClosingTag.tagName.length
    const word = tagName

    return {
      startOffset,
      endOffset,
      word,
    }
  }
}

doAutoCompletionElementRenameTag('<input></dov>', 10) //?
// createDoAutoRenameTagCompletion('', 5) //?

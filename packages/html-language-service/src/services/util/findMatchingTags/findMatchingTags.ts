import {
  createScanner,
  ScannerState,
  TokenType,
} from '@html-language-features/html-parser'
import { isSelfClosingTag } from '../../../Data/Data'
import {
  getNextClosingTag,
  getPreviousOpeningTagName,
} from '../getParentTagName'

export type MatchingTagResult =
  | {
      type: 'startAndEndTag'
      tagName: string
      startTagOffset: number
      endTagOffset: number
    }
  | {
      type: 'onlyStartTag'
      tagName: string
      startTagOffset: number
    }
  | {
      type: 'onlyEndTag'
      tagname: string
      endTagOffset: number
    }

export const findMatchingTags: (
  text: string,
  offset: number
) => MatchingTagResult | undefined = (text, offset) => {
  const scanner = createScanner(text, { initialOffset: offset })
  scanner.stream.goBackToUntilEitherChar('<', '>')
  const char = scanner.stream.peekLeft(1) //?
  if (char === '<') {
    if (scanner.stream.nextChars(2) === '--') {
      return undefined
    }
    if (scanner.stream.peekRight() === '/') {
      const endTagOffset = scanner.stream.position //?
      scanner.stream.advance(1)
      scanner.state = ScannerState.AfterOpeningEndTag
      scanner.scan()
      const tagName = scanner.getTokenText()
      scanner.stream.position //?
      const previousOpenTagName = getPreviousOpeningTagName(
        scanner,
        endTagOffset - 2
      )
      if (!previousOpenTagName || tagName !== previousOpenTagName.tagName) {
        return undefined
      }
      return {
        type: 'startAndEndTag',
        tagName,
        startTagOffset: previousOpenTagName.offset - 1,
        endTagOffset: endTagOffset - 1,
      }
    } else {
      const startTagOffset = scanner.stream.position - 1
      scanner.state = ScannerState.AfterOpeningStartTag
      const token = scanner.scan()
      if (token !== TokenType.StartTag) {
        return undefined
      }
      const tagName = scanner.getTokenText()
      if (isSelfClosingTag(tagName)) {
        return {
          type: 'onlyStartTag',
          tagName,
          startTagOffset,
        }
      }
      scanner.stream.advanceUntilChar('>')
      scanner.stream.advance(1)
      const nextClosingTag = getNextClosingTag(scanner, scanner.stream.position)
      if (!nextClosingTag || nextClosingTag.tagName !== tagName) {
        return {
          type: 'onlyStartTag',
          tagName,
          startTagOffset,
        }
      }
      return {
        type: 'startAndEndTag',
        tagName,
        startTagOffset,
        endTagOffset: nextClosingTag.offset - 2,
      }
    }
  } else if (char === '>') {
    if (offset >= scanner.stream.position) {
      return undefined
    }
    scanner.stream.goBack(2)
    scanner.stream.goBackToUntilEitherChar('<', '>')
    const char = scanner.stream.peekLeft(1) //?
    if (char === '>') {
      return undefined
    }
    return findMatchingTags(scanner.stream.getSource(), scanner.stream.position)
  }
  return undefined
}

findMatchingTags('<a>a</a>', 0) //?

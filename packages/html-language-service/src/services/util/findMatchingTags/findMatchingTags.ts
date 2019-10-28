import {
  createScanner,
  ScannerState,
} from '@html-language-features/html-parser'
import { getPreviousOpeningTagName } from '../getParentTagName'

export const findMatchingTags: (
  text: string,
  offset: number
) =>
  | undefined
  | {
      type: 'startAndEndTag'
      tagName: string
      startTagOffset: number
      endTagOffset: number
    } = (text, offset) => {
  const scanner = createScanner(text)
  scanner.stream.goTo(offset)
  console.log('peek', scanner.stream.peekRight())
  scanner.stream.goBackToUntilEitherChar('<', '>')
  const char = scanner.stream.peekLeft(1) //?
  if (char === '<') {
    console.log('char is' + char)
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
    }
  } else if (char === '>') {
    if (offset - scanner.stream.position === 0) {
      return undefined
    }
    console.log('off' + offset + 'sc' + scanner.stream.position)
    console.log('else')
    scanner.stream.goBack(2)
    scanner.stream.goBackToUntilEitherChar('<', '>')
    const char = scanner.stream.peekLeft(1) //?
    console.log('char is ' + char)
    if (char === '>') {
      return undefined
    }
    return findMatchingTags(scanner.stream.getSource(), scanner.stream.position)
  }
  return undefined
}

findMatchingTags('<a>a</a>', 7) //?

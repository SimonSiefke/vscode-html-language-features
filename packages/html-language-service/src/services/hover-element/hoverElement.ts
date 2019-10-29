import { getHTMLTags } from '../../data/HTMLManager'
import {
  createScanner,
  ScannerState,
  TokenType,
} from '@html-language-features/html-parser'

// TODO merge all those "get tag at offset" functions

// const getTagInfo: (tagName: string) => string | undefined = tagName => {
//   console.log(tagName)
//   const htmlTags = getHTMLTags()
//   htmlTags['h2'] = { description: 'h2 tag' }
//   const match = htmlTags[tagName]
//   if (!match) {
//     return undefined
//   }
//   return match.description
// }

export const doHoverElement: (
  text: string,
  offset: number
) => { startOffset: number; endOffset: number; tagName: string } | undefined = (
  text,
  offset
) => {
  const scanner = createScanner(text, { initialOffset: offset })
  if (['>', '<', '/'].includes(scanner.stream.peekRight())) {
    return undefined
  }
  scanner.stream.goBackToUntilEitherChar('<', '>', ' ', '\n', '/')
  const char = scanner.stream.peekLeft(1) //?
  if (char !== '<') {
    return undefined
  }

  if (scanner.stream.peekLeft(1) !== '<') {
    return undefined
  }
  scanner.state = ScannerState.AfterOpeningStartTag
  const offsetBeforeTag = scanner.stream.position
  let tagName: string
  if (scanner.scan() === TokenType.StartTag) {
    tagName = scanner.getTokenText()
  } else {
    // try to find end tag
    scanner.stream.goTo(offsetBeforeTag - 1)
    scanner.state = ScannerState.WithinContent
    if (scanner.scan() !== TokenType.EndTagOpen) {
      return undefined
    }
    if (scanner.scan() !== TokenType.EndTag) {
      return undefined
    }
    tagName = scanner.getTokenText()
  }
  if (!tagName) {
    return undefined
  }
  const tagNameStart = scanner.getTokenOffset()
  const tagNameEnd = scanner.getTokenEnd()

  return {
    startOffset: tagNameStart,
    endOffset: tagNameEnd,
    tagName,
  }
  // const r: Hover = {
  //   contents: {
  //     kind: MarkupKind.Markdown,
  //     value: '# hello world',
  //   },
  //   range: {
  //     start: document.positionAt(tagNameStart),
  //     end: document.positionAt(tagNameEnd),
  //   },
  // }
  // console.log(r)
  // return r
}

// doHoverElement('<h2/>', 2) //?

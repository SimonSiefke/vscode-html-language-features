import { isSelfClosingTag } from '../../data/HTMLManager'
import { Scanner, ScannerState, TokenType, createScanner } from 'html-parser'

export function getPreviousOpeningTagName(
  scanner: Scanner,
  initialOffset: number
):
  | {
      tagName: string
      offset: number
    }
  | undefined {
  let offset = initialOffset + 2
  let parentTagName: string | undefined
  let stack: string[] = []
  // let i = 0
  do {
    // if (i++ > 10) {
    //   console.log('no')
    //   return undefined
    // }
    scanner.stream.goTo(offset - 2)
    scanner.stream.goBackToUntilEitherChar('<', '>')
    const char = scanner.stream.peekLeft(1)
    if (!['<', '>'].includes(char)) {
      return undefined
    }
    if (char === '>') {
      // skip comment
      if (scanner.stream.previousChars(3) === '-->') {
        scanner.stream.goBackToUntilChars('<!--')
        offset = scanner.stream.position - 3
        continue
      } else {
        scanner.stream.goBackToUntilChar('<')
        // scanner.stream.goBack(1)
        offset = scanner.stream.position
      }
    }
    // don't go outside of comment when inside
    if (scanner.stream.nextChars(3) === '!--') {
      return undefined
    }
    // push closing tags onto the stack
    if (scanner.stream.peekRight() === '/') {
      offset = scanner.stream.position - 1
      scanner.stream.advance(1)
      scanner.state = ScannerState.AfterOpeningEndTag
      scanner.scan()
      console.log('push' + scanner.getTokenText())
      stack.push(scanner.getTokenText())
      continue
    }
    offset = scanner.stream.position
    scanner.state = ScannerState.AfterOpeningStartTag
    const token = scanner.scan()
    if (token !== TokenType.StartTag) {
      return undefined
    }
    const tokenText = scanner.getTokenText()
    // pop closing tags from the tags
    if (stack.length) {
      if (stack.pop() !== tokenText) {
        console.error('no')
      }
      continue
    }
    parentTagName = scanner.getTokenText()
  } while (parentTagName === undefined || isSelfClosingTag(parentTagName))
  return {
    tagName: parentTagName,
    offset,
  }
}

export function getNextClosingTag(
  scanner: Scanner,
  initialOffset: number
):
  | {
      tagName: string
      offset: number
    }
  | undefined {
  scanner.stream.goTo(initialOffset)
  let offset = scanner.stream.position
  let parentTagName: string | undefined
  let stack: string[] = []
  // scanner.state = ScannerState.WithinContent
  let i = 0
  while (!scanner.stream.eos()) {
    // console.log('before: ' + scanner.stream.previousChars(5))
    // console.log('|')
    if (i++ > 3) {
      console.log('iun')
      return undefined
    }
    scanner.stream.advanceUntilEitherChar('<', '>')
    const char = scanner.stream.peekRight()
    if (char === '<') {
      if (scanner.stream.nextChars(4) === '<!--') {
        scanner.stream.advanceUntilChars('-->')
        scanner.stream.advance(3)
        continue
      }
      if (scanner.stream.nextChars(2) === '</') {
        scanner.stream.advance(2)
        scanner.state = ScannerState.AfterOpeningEndTag
        offset = scanner.stream.position
        const token = scanner.scan()
        if (token !== TokenType.EndTag) {
          return undefined
        }
        const closingTagName = scanner.getTokenText()
        // pop closing tags from the tags
        if (stack.length) {
          if (stack.pop() !== closingTagName) {
            console.error('no')
          }
          scanner.stream.advanceUntilChar('>')
          scanner.stream.advance(1)
          continue
        } else {
          return {
            tagName: closingTagName,
            offset,
          }
        }
      }
      scanner.state = ScannerState.AfterOpeningStartTag
      scanner.scan()
      const tagName = scanner.getTokenText()
      if (!isSelfClosingTag(tagName)) {
        stack.push(tagName)
      }
      // continue
    }
  }

  // const token = scanner.scan()
  // if (token === TokenType.StartTagOpen) {
  //   scanner.scan()
  //   const tagName = scanner.getTokenText()
  //   stack.push(tagName)
  // }
  // if (token === TokenType.StartCommentTag) {
  //   while (scanner.scan() !== TokenType.EndCommentTag) {}
  // }
  // do {
  // scanner.stream.goTo(offset)
  // const char = scanner.stream.peekRight()

  // if (char === '>') {
  //   // skip comment
  //   if (scanner.stream.previousChars(3) === '-->') {
  //     scanner.stream.goBackToUntilChars('<!--')
  //     offset = scanner.stream.position - 3
  //     continue
  //   } else {
  //     scanner.stream.goBackToUntilChar('<')
  //     offset = scanner.stream.position
  //   }
  // }
  // // don't go outside of comment when inside
  // if (scanner.stream.nextChars(3) === '!--') {
  //   return undefined
  // }

  // push opening tags onto the stack
  // } while (parentTagName === undefined || isSelfClosingTag(parentTagName))
  // return {
  //   tagName: parentTagName,
  //   offset,
  // }
}

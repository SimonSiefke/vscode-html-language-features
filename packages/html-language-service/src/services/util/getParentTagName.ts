import { isSelfClosingTag } from '../../data/HTMLManager'
import {
  Scanner,
  ScannerState,
  TokenType,
  createScanner,
} from '@html-language-features/html-parser'

export const getPreviousOpeningTagName: (
  scanner: Scanner,
  initialOffset: number
) =>
  | {
      tagName: string
      offset: number
      seenRightAngleBracket: boolean
    }
  | undefined = (scanner, initialOffset) => {
  let offset = initialOffset + 2
  let parentTagName: string | undefined
  let stack: string[] = []
  let seenRightAngleBracket = false
  let i = 0
  do {
    if (i++ > 100) {
      throw new Error('infinite loop')
    }
    scanner.stream.goTo(offset - 2)
    scanner.stream.position //?
    scanner.stream.goBackToUntilEitherChar('<', '>')
    // scanner.stream.goBack(1)
    scanner.stream.position //?
    const char = scanner.stream.peekLeft(1) //?
    console.log('char' + char)
    if (!['<', '>'].includes(char)) {
      console.log('retun 1' + char)
      char //?
      return undefined
    }
    if (char === '>') {
      // skip comment
      if (scanner.stream.previousChars(3) === '-->') {
        scanner.stream.goBackToUntilChars('<!--')
        offset = scanner.stream.position - 3
        continue
      } else {
        seenRightAngleBracket = true
        console.log('go all back')
        scanner.stream.goBack(1)
        scanner.stream.goBackToUntilChar('<')
        offset = scanner.stream.position
      }
    }
    if (char === '<') {
      seenRightAngleBracket //?
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
      const token = scanner.getTokenText()
      if (token === '') {
        offset = scanner.stream.position - 1
        continue
      }
      // console.log('push' + scanner.getTokenText())
      stack.push(scanner.getTokenText())
      continue
    }
    offset = scanner.stream.position
    scanner.state = ScannerState.AfterOpeningStartTag
    // scanner.stream.advance(1)
    console.log('oo' + offset)
    const token = scanner.scan()
    // if (!seenRightAngleBracket) {
    //   console.log('no see')
    // }
    if (token !== TokenType.StartTag) {
      console.log('no start tag')
      return undefined
    }
    const tokenText = scanner.getTokenText()
    if (isSelfClosingTag(tokenText)) {
      console.log('self closing')
      continue
    }
    // pop closing tags from the tags
    if (stack.length && !isSelfClosingTag(tokenText)) {
      if (stack.pop() !== tokenText) {
        console.error('no')
      }
      continue
    }
    parentTagName = tokenText
    console.log('parent is' + parentTagName)
    if (parentTagName !== undefined) {
      break
    }
  } while (true)

  console.log('retunin')
  return {
    tagName: parentTagName,
    offset,
    seenRightAngleBracket,
  }
}

// const text = `<select>
//   <`
// const offset = text.length //?
// getPreviousOpeningTagName(createScanner(text), offset-1) //?

export const getNextClosingTag: (
  scanner: Scanner,
  initialOffset: number
) =>
  | {
      tagName: string
      offset: number
    }
  | undefined = (scanner, initialOffset) => {
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
            console.error('no 2')
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

// getPreviousOpeningTagName(createScanner('<div class="">div'), 14) //?

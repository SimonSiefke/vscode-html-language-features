// import {
//   TextDocument,
//   Position,
//   Hover,
//   CompletionItem,
//   MarkedString,
// } from 'vscode-languageserver-types'
// import { getHTMLTags } from '../../data/HTMLManager'
// import {
//   createScannerReadable,
//   ScannerStateReadable,
//   TokenTypeReadable,
// } from '../../htmlScanner/htmlScannerReadable'

// function getTagInfo(tagName: string): string | undefined {
//   const htmlTags = getHTMLTags()
//   const match = htmlTags[tagName]
//   if (!match) {
//     return undefined
//   }
//   return match.description
// }

// export function doHover(
//   document: TextDocument,
//   position: Position
// ): Hover | undefined {
//   const offset = document.offsetAt(position)
//   const text = document.getText()
//   const scanner = createScannerReadable(text)
//   scanner.stream.goTo(offset)
//   if (['>', '<', '/'].includes(scanner.stream.peekRight())) {
//     return undefined
//   }
//   scanner.stream.goBackToUntilChar('<')
//   const currentPosition = scanner.stream.position
//   scanner.stream.goTo(offset)
//   scanner.stream.goBackToUntilChar('>')
//   const otherPosition = scanner.stream.position
//   if (otherPosition > currentPosition) {
//     return undefined
//   }
//   scanner.stream.goTo(currentPosition)
//   if (scanner.stream.peekLeft(1) !== '<') {
//     return undefined
//   }
//   scanner.state = ScannerStateReadable.AfterOpeningStartTag
//   const offsetBeforeTag = scanner.stream.position
//   let tagName: string
//   if (scanner.scan() === TokenTypeReadable.StartTag) {
//     tagName = scanner.getTokenText()
//   } else {
//     // try to find end tag
//     scanner.stream.goTo(offsetBeforeTag - 1)
//     scanner.state = ScannerStateReadable.WithinContent
//     if (scanner.scan() !== TokenTypeReadable.EndTagOpen) {
//       return undefined
//     }
//     if (scanner.scan() !== TokenTypeReadable.EndTag) {
//       return undefined
//     }
//     tagName = scanner.getTokenText()
//   }
//   if (!tagName) {
//     return undefined
//   }
//   const tagNameStart = scanner.getTokenOffset()
//   const tagNameEnd = scanner.getTokenEnd()

//   const tagInfo = getTagInfo(tagName)
//   if (!tagInfo) {
//     return undefined
//   }
//   const r: Hover = {
//     contents: [
//       {
//         language: 'html',
//         value: tagInfo,
//       },
//     ],
//     range: {
//       start: document.positionAt(tagNameStart),
//       end: document.positionAt(tagNameEnd),
//     },
//   }
//   console.log(r)
//   return r
// }

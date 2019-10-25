// import {
//   isSelfClosingTag,
//   addConfig,
//   shouldHaveNewline,
// } from '../../../data/HTMLManager'

// import {
//   DoCompletion,
//   createDoCompletion,
//   Completion,
// } from '../htmlClosingTagCompletion'
// import { ScannerState, TokenType, createScanner, Scanner } from 'html-parser'
// import {
//   getPreviousOpeningTagName,
//   getNextClosingTag,
// } from '../../htmlCompletion/getParentTagName'
// import { completionElementExpand } from '../../completion-element-expand/completionElementExpand'

// const getEmmetTagCompletion = (tagName: string) => {
//   if (isSelfClosingTag(tagName)) {
//     return `<${tagName}>`
//   }
//   if (shouldHaveNewline(tagName)) {
//     return `<${tagName}>\n\t$0\n</${tagName}>`
//   }
//   return `<${tagName}>$0</${tagName}>`
// }

// const createDoEmmetCompletion = (text: string, offset: number) => {
//   const scanner = createScanner(text)
//   scanner.stream.goTo(offset)
//   return emmetTagCompletion(scanner)
// }

// export const doEmmetTagCompletion = createDoEmmetCompletion

// import {
//   CompletionItem,
//   CompletionList,
//   Position,
//   TextEdit,
//   Range,
// } from 'vscode-languageserver-types'
// import { getHTMLTagNames } from '../../data/HTMLManager'

// export function htmlEmmetTagCompletion(position: Position): CompletionList {
//   const tagNames = getHTMLTagNames()
//   const htmlTagSuggestions = tagNames.map(
//     tagName => `<${tagName}></${tagName}>`
//   )

//   const items: CompletionItem[] = htmlTagSuggestions.map(suggestion => ({
//     label: suggestion,
//     textEdit: TextEdit.replace(Range.create(position, position), suggestion),
//   }))
//   // const items =
//   return {
//     isIncomplete: false,
//     items,
//   }
// }

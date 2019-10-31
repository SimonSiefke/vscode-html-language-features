import {
  createScanner,
  ScannerState,
} from '@html-language-features/html-parser'
import {
  NamedAttributeValue,
  getSuggestedAttributeValues,
} from '../../data/Data'

/**
 * Suggestions for attribute names
 *`<option |` -> ``.
 */
export const doSuggestionAttributeValue: (
  text: string,
  offset: number
) =>
  | {
      tagName: string
      attributeName: string
      attributeValues: NamedAttributeValue[]
    }
  | undefined = (text, offset) => {
  let tagName = 'a'
  let attributeName = 'target'
  // const scanner = createScanner(text)
  // scanner.stream.goTo(offset)

  // const endsWithAttributeValue = scanner.stream.currentlyEndsWithRegex(
  //   /\S+=\S+$/
  // )
  // if (endsWithAttributeValue) {
  //   return undefined
  // }
  // const isSomewhereInStartingTag = scanner.stream.currentlyEndsWithRegex(
  //   /<[\S]+\s+[\s\S]*$/
  // )
  // if (!isSomewhereInStartingTag) {
  //   return undefined
  // }
  // scanner.stream.goBackToUntilEitherChar('<', '>')
  // const char = scanner.stream.peekLeft()
  // if (char === '>') {
  //   return undefined
  // }
  // scanner.state = ScannerState.AfterOpeningStartTag
  // scanner.scan()
  // const tagName = scanner.getTokenText()

  // if (!tagName) {
  //   return undefined
  // }
  const attributeValues = getSuggestedAttributeValues(tagName, attributeName)
  if (!attributeValues) {
    return undefined
  }
  return {
    attributeValues,
    attributeName,
    tagName,
  }
}

// setConfig({
//   elements: {
//     h1: {
//       attributes: {
//         class: {},
//       },
//     },
//   },
// })

// console.log('ok')
// doSuggestionAttributeKey('<h1 > ', 3) //?

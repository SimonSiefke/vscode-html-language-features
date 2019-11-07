import {
  createScanner,
  ScannerState,
  TokenType,
} from '@html-language-features/html-parser'
import {
  getSuggestedAttributeValues,
  NamedAttributeValue,
  getAttributeType,
} from '../../Data/Data'
import { AttributeType } from '@html-language-features/schema'

/**
 * Suggestions for attribute values
 * @example
 * doCompletionAttributeValue('<a target="">', 11) // { tagName: 'a', attributeName: 'target', attributeValues: [{ name: '_blank' }] }
 */
export const doCompletionAttributeValue: (
  text: string,
  offset: number
) =>
  | {
      tagName: string
      attributeName: string
      attributeValues: NamedAttributeValue[]
    }
  | {
      tagName: string
      attributeName: string
      attributeType: AttributeType
    }
  | undefined = (text, offset) => {
  const scanner = createScanner(text, { initialOffset: offset })

  const endsWithAttributeValue = scanner.stream.currentlyEndsWithRegex(
    /\S+=\S+$/
  )
  if (!endsWithAttributeValue) {
    return undefined
  }
  const isSomewhereInStartingTag = scanner.stream.currentlyEndsWithRegex(
    /<[\S]+\s+[\s\S]*$/
  )
  if (!isSomewhereInStartingTag) {
    return undefined
  }
  scanner.stream.goBackToUntilEitherChar('<', '>')
  const char = scanner.stream.peekLeft()
  if (char === '>') {
    return undefined
  }
  scanner.state = ScannerState.AfterOpeningStartTag
  scanner.scan()
  const tagName = scanner.getTokenText()

  if (!tagName) {
    return undefined
  }
  let lastSeenAttributeName: string | undefined
  while (scanner.stream.position < offset) {
    const token = scanner.scan()
    const text = scanner.getTokenText()
    if (token === TokenType.AttributeName) {
      lastSeenAttributeName = text
      // console.log(text)
    } else if (token === TokenType.DelimiterAssign) {
      // nothing
    } else if (token === TokenType.AttributeValue) {
      if (scanner.stream.position >= offset) {
        // console.log('break')
        break
      }
      lastSeenAttributeName = undefined
    } else {
      return undefined
    }
  }
  if (!lastSeenAttributeName) {
    return undefined
  }
  const attributeValues = getSuggestedAttributeValues(
    tagName,
    lastSeenAttributeName
  )
  if (attributeValues) {
    return {
      attributeValues,
      attributeName: lastSeenAttributeName,
      tagName,
    }
  }
  const attributeType = getAttributeType(tagName, lastSeenAttributeName)
  if (!attributeType) {
    return undefined
  }
  return {
    attributeType,
    attributeName: lastSeenAttributeName,
    tagName,
  }
}

// setConfig({
//   elements: {
//     a: {
//       attributes: {
//         rel: {
//           options: {
//             'noopener noreferrer': {},
//           },
//         },
//         target: {
//           options: {
//             _blank: {},
//           },
//         },
//       },
//     },
//   },
// })

// doSuggestionAttributeValue('<a target="_blank" rel=""> ', 24) //?

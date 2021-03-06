import {
  createScanner,
  ScannerState,
} from '@html-language-features/html-parser'
import { getSuggestedTags, isTagName } from '../../Data/Data'
import { getPreviousOpeningTagName } from '../util/getParentTagName'

const fuzzySearch = (tagName: string, abbreviation: string) => {
  // If the string is equal to the word, perfect match.
  if (tagName === abbreviation) {
    return 1
  }

  // If it's not a perfect match and is empty return 0.
  if (abbreviation === '') {
    return 0
  }
  if (abbreviation.length > tagName.length) {
    return 0
  }
  let matchingChars = 0
  for (let i = 0; i < abbreviation.length; i++) {
    if (abbreviation[i] === tagName[i]) {
      matchingChars++
    }
  }
  return (matchingChars / abbreviation.length) * 0.99
}

/**
 * Expands `div` into `div` but doesn't handle partial matches like `di`
 */
const fallback = (abbreviation: string) => {
  if (isTagName(abbreviation)) {
    return abbreviation
  }
  return undefined
}

/**
 * Finds the most likely tagname for an abbreviation.
 * E.g. When the user types `d` or `di` it is most likely a `div`
 *
 * @param abbreviation - the partial tag name
 * @param parentTagName - the name of the parent tag (or root if there is no parent tag)
 */
export const expandAbbreviation = (
  abbreviation: string,
  parentTagName: string
): string | undefined => {
  const suggestions = getSuggestedTags(parentTagName)
  if (!suggestions) {
    return fallback(abbreviation)
  }
  suggestions
  const relevantSuggestions = suggestions
    .map(name => ({
      name,
      score: fuzzySearch(name, abbreviation),
    }))
    .filter(x => x.score > 0)
  if (relevantSuggestions.length === 0) {
    return fallback(abbreviation)
  }
  const sorted = relevantSuggestions.sort((a, b) => {
    return b.score - a.score
  })
  if (sorted[0].score === 1 || sorted[0].score >= 0.6) {
    return sorted[0].name
  }
  return fallback(abbreviation)
}

/**
 * Completion for expanding tag
 *`sp` -> `<span></span>`.
 */
export const doCompletionElementExpand: (
  text: string,
  offset: number
) => string[] = (text, offset) => {
  const scanner = createScanner(text, { initialOffset: offset })
  // const prevChar = scanner.stream.peekLeft(1) //?
  // const currentChar = scanner.stream.peekRight(0) //?
  // const nextChar = scanner.stream.peekRight(1) //?
  // if (prevChar.trim() || !currentChar.trim()) {
  // }
  scanner.stream.goBackToUntilEitherChar('<', '>')
  const char = scanner.stream.peekLeft(1)
  if (char === '<') {
    return []
  }
  scanner.stream.goTo(offset)
  const leftChar = scanner.stream.peekLeft(1)
  if (leftChar === '<' || !leftChar.trim()) {
    return []
  }
  if (!scanner.stream.currentlyEndsWithRegex(/[\S]+$/)) {
    return []
  }
  const currentPosition = scanner.stream.position
  scanner.stream.goBackToUntilChar('\n')
  const startOfLine = scanner.stream.position //?
  scanner.stream.goTo(currentPosition)
  const tagNameRE = /(?![>\/])[\S]/
  while (
    scanner.stream.position >= startOfLine &&
    tagNameRE.test(scanner.stream.peekLeft())
  ) {
    scanner.stream.position--
  }
  scanner.stream.position++
  const completionOffset = scanner.stream.position
  scanner.state = ScannerState.WithinContent
  scanner.scan()
  const incompleteTagName = scanner.getTokenText().trim()

  const parent = getPreviousOpeningTagName(scanner, completionOffset)
  let tagName: string | undefined

  if (parent && !parent.seenRightAngleBracket) {
    return []
  }

  const parentTagName = (parent && parent.tagName) || 'root'
  const suggestions = getSuggestedTags(parentTagName)

  return suggestions
  // if (!parent) {
  //   tagName = expandAbbreviation(incompleteTagName, 'root')
  // } else {
  //   tagName = expandAbbreviation(incompleteTagName, parent.tagName)
  // }
  // if (!tagName) {
  //   return undefined
  // }

  // let completionString: string
  // if (isSelfClosingTag(tagName)) {
  //   completionString = `<${tagName}>`
  // } else if (shouldHaveNewline(tagName)) {
  //   completionString = `<${tagName}>\n\t$0\n</${tagName}>`
  // } else {
  //   completionString = `<${tagName}>$0</${tagName}>`
  // }
  // return {
  //   completionString,
  //   completionOffset,
  // }
}

// addConfig({
//   elements: {
//     div: {
//       newline: true,
//     },
//     h1: {},
//     ul: {
//       newline: true,
//     },
//     input: {
//       selfClosing: true,
//     },
//     Daten: {},
//     DatenSätze: {},
//     option: {},
//     select: {},
//   },
// })

// doCompletionElementExpand('<!-- -->div<!-- -->', 11) //?
// // doCompletionElementExpand('h1', 2) //?

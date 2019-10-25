import { statisticsForTags } from 'html-intellicode'
import {
  getHTMLTags,
  isSelfClosingTag,
  shouldHaveNewline,
} from '../../data/HTMLManager'
import { ScannerState, createScanner } from 'html-parser'
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
  const htmlTagMap = getHTMLTags()
  if (htmlTagMap[abbreviation]) {
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
  const suggestions = statisticsForTags[parentTagName]
  if (!suggestions) {
    return fallback(abbreviation)
  }
  suggestions
  const relevantSuggestions = suggestions
    .map(x => ({
      ...x,
      score: fuzzySearch(x.name, abbreviation),
    }))
    .filter(x => x.score > 0)
  if (relevantSuggestions.length === 0) {
    return fallback(abbreviation)
  }
  const sorted = relevantSuggestions.sort((a, b) => {
    return b.score - a.score || b.probability - a.probability
  })
  if (sorted[0].score === 1 || sorted[0].score >= 0.6) {
    return sorted[0].name
  }
  // getHTMLTagNames()
  return fallback(abbreviation)
}

/**
 * Completion for expanding tag
 *`sp` -> `<span></span>`.
 */
export const doCompletionElementExpand: (
  text: string,
  offset: number
) =>
  | ({
      completionString: string
      completionOffset: number
    })
  | undefined = (text, offset) => {
  const scanner = createScanner(text)
  scanner.stream.goTo(offset)
  if (!scanner.stream.currentlyEndsWithRegex(/[\S]+$/)) {
    return undefined
  }
  const currentPosition = scanner.stream.position
  scanner.stream.goBackToUntilChar('\n')
  const startOfLine = scanner.stream.position
  scanner.stream.goTo(currentPosition)
  const tagNameRE = /[\S]/
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
  const incompleteTagName = scanner.getTokenText()
  const parent = getPreviousOpeningTagName(scanner, completionOffset)
  let tagName: string | undefined

  if (parent && !parent.seenRightAngleBracket) {
    return undefined
  }
  if (!parent) {
    console.log('no parent')
    tagName = expandAbbreviation(incompleteTagName, 'root')
  } else {
    tagName = expandAbbreviation(incompleteTagName, parent.tagName)
  }
  if (!tagName) {
    return undefined
  }

  let completionString: string
  if (isSelfClosingTag(tagName)) {
    completionString = `<${tagName}>`
  } else if (shouldHaveNewline(tagName)) {
    completionString = `<${tagName}>\n\t$0\n</${tagName}>`
  } else {
    completionString = `<${tagName}>$0</${tagName}>`
  }
  return {
    completionString,
    completionOffset,
  }
}

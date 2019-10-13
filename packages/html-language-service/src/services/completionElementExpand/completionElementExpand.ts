import { statistics } from 'html-intellicode'
import { fuzzySearch } from './fuzzySearch'
import { getHTMLTags } from '../../data/HTMLManager'

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
export const completionElementExpand = (
  abbreviation: string,
  parentTagName: string
): string | undefined => {
  console.log('abr' + abbreviation)
  console.log('expand' + parentTagName)
  const suggestions = statistics[parentTagName]
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

// expand('d', 'div') //?
// score('hello', 'he') //?

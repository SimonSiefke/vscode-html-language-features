import { statistics } from 'html-intellicode'
import { fuzzySearch } from './fuzzySearch'

// const statistics = {
//   div: {
//     subtags: ['div'],
//   },
// }

export function expand(
  abbreviation: string,
  parentTagName: string
): string | undefined {
  const suggestions = statistics[parentTagName]
  if (!suggestions) {
    return undefined
  }
  suggestions
  const relevantSuggestions = suggestions
    .map(x => ({
      ...x,
      score: fuzzySearch(x.name, abbreviation),
    }))
    .filter(x => x.score > 0)
  if (relevantSuggestions.length === 0) {
    return undefined
  }
  const sorted = relevantSuggestions.sort((a, b) => {
    return b.score - a.score || b.probability - a.probability
  })
  if (sorted[0].score === 1 || sorted[0].score >= 0.6) {
    return sorted[0].name
  }
  return undefined
}

// expand('d', 'div') //?
// score('hello', 'he') //?

import { getEditDistance } from './levenshtein'

const fuzzySearchTwo: (a: string, b: string) => number = (a, b) => {
  if (a === b) {
    return a.length
  }
  if (!a || a[0] !== b[0]) {
    return 0
  }
  let score = 0
  for (let i = 0; i < a.length; i++) {
    if (a[i] === b[i]) {
      score++
    } else {
      for (let j = i + 1; j < b.length; j++) {
        if (a[i] === b[j]) {
          score++
          break
        }
      }
    }
  }
  return score / a.length
}

// fuzzySearchTwo('t', 'type')//?
// fuzzySearchTwo('buton', 'button')//?

// fuzzySearchTwo('dl', 'datetime-local') //?
// fuzzySearchTwo('dl', 'date') //?

// fuzzySearchTwo('time', 'time') //?

fuzzySearchTwo('t', 'type') //?

export const fuzzySearch: (
  partialAttributeName: string,
  attributeName: string,
  attributeValues?: string[]
) => {
  attributeOnlyScore: number
  attributeValueScores?: number[]
} = (partialAttributeName, attributeName, attributeValues) => {
  if (!partialAttributeName) {
    return { attributeOnlyScore: 1 }
  }
  if (partialAttributeName === attributeName) {
    return {
      attributeOnlyScore: 1,
    }
  }
  // a string MUST start with the same character as abbreviation
  if (partialAttributeName[0] !== attributeName[0]) {
    return {
      attributeOnlyScore: 0,
    }
  }
  if (!attributeValues || attributeValues.length === 0) {
    return {
      attributeOnlyScore: fuzzySearchTwo(partialAttributeName, attributeName),
    }
  }
  let attributeOnlyScore = 0
  let attributeValueScores = [...Array(attributeValues.length).fill(0)] //?
  let highestCombinedScore = 0
  let highestCombinedScoreIndex = -1
  let highestFirstScore = 0
  for (let i = 0; i <= partialAttributeName.length; i++) {
    const firstPart = partialAttributeName.slice(0, i) //?
    const secondPart = partialAttributeName.slice(i) //?
    const firstScore = fuzzySearchTwo(firstPart, attributeName)
    const secondScore = Math.max(
      ...attributeValues.map(attributeValue =>
        fuzzySearchTwo(secondPart, attributeValue)
      )
    )
    const combinedScore = firstScore + secondScore
    if (combinedScore > highestCombinedScore) {
      highestCombinedScore = combinedScore
      highestCombinedScoreIndex = i
    }
    if (
      firstScore > highestFirstScore &&
      combinedScore >= highestCombinedScore
    ) {
      highestCombinedScoreIndex = i
      highestFirstScore = firstScore
    }
  }
  const firstPart = partialAttributeName.slice(0, highestCombinedScoreIndex)
  const secondPart = partialAttributeName.slice(highestCombinedScoreIndex)
  attributeOnlyScore = fuzzySearchTwo(firstPart, attributeName)
  for (let j = 0; j < attributeValueScores.length; j++) {
    attributeValueScores[j] = fuzzySearchTwo(secondPart, attributeValues[j])
  }
  return {
    attributeOnlyScore,
    attributeValueScores,
  }
}

// const inputTypes = [
//   'button',
//   'checkbox',
//   'color',
//   'date',
//   'datetime-local',
//   'email',
//   'file',
//   'hidden',
//   'image',
//   'month',
//   'number',
//   'password',
//   'radio',
//   'range',
//   'reset',
//   'search',
//   'submit',
//   'tel',
//   'text',
//   'time',
//   'url',
//   'week',
// ]

// const result = fuzzySearch('time', 'type', inputTypes)

// // console.log(result)

// const sortedInputTypes = inputTypes.slice().sort((a, b) => {
//   const indexA = inputTypes.indexOf(a)
//   const indexB = inputTypes.indexOf(b)
//   const scoreA = result.attributeValueScores[indexA]
//   const scoreB = result.attributeValueScores[indexB]
//   return scoreB - scoreA
// })

// sortedInputTypes //?

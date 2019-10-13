export function fuzzySearch(tagName: string, abbreviation: string) {
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

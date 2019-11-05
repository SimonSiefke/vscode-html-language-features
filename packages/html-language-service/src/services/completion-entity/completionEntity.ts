export const doCompletionEntity: (
  text: string,
  offset: number,
  entities: { [key: string]: string }
) => string[] = (text, offset, entities) => {
  const previousChar = text[offset - 1]
  if (previousChar !== '&') {
    return []
  }
  return Object.keys(entities)
}

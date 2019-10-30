export const removeDeprecatedItems: <T extends { deprecated?: boolean }>(
  items: T[]
) => T[] = items => items.filter(item => item.deprecated !== true)

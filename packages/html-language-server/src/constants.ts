export interface Constants {
  /**
   * Wether or not to show deprecated completions
   */
  showDeprecatedCompletions: boolean
  /**
   * The quote char used for attribute completions
   */
  quote: '"' | "'"
}

export const constants: Constants = {
  showDeprecatedCompletions: false,
  quote: '"',
}

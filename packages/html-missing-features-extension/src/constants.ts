export interface Constants {
  /**
   * Array of ids where this extension is enabled
   */
  readonly allowedLanguageIds: string[]

  /**
   * Maximum numbers of characters in a document, for which this extension is enabled.
   * For larger files it would cause high cpu load.
   */
  readonly maxAllowedChars: number

  readonly config: any
}
export const constants = {
  allowedLanguageIds: [
    'html',
    'javascript',
    'javascriptreact',
    'php',
    'razor',
    'svelte',
    'typescript',
    'typescriptreact',
    'xml',
    'vue',
  ],
  maxAllowedChars: 80000,
  config: {
    tags: {
      area: {
        selfClosing: true,
      },
      base: {
        selfClosing: true,
      },
      br: {
        selfClosing: true,
      },
      hr: {
        selfClosing: true,
      },
      iframe: {
        selfClosing: true,
      },
      link: {
        selfClosing: true,
      },
      meta: {
        selfClosing: true,
      },
      param: {
        selfClosing: true,
      },
      source: {
        selfClosing: true,
      },
      track: {
        selfClosing: true,
      },
      input: {
        selfClosing: true,
      },
      img: {
        selfClosing: true,
      },
      '?php': {
        selfClosing: true,
      },
    },
  },
}

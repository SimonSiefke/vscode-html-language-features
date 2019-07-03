import {
  Scanner,
  ScannerState,
  TokenType,
  createScanner,
} from 'html-parser'

/* eslint-disable no-param-reassign */
// import { isSelfClosingTag, shouldHaveNewline } from '../../data/HTMLManager'
// import {
//   Scanner,
//   ScannerState,
//   TokenType,
//   createScanner,
// } from '../../htmlScanner/htmlScanner'

export interface Completion<CompletionArgs extends object> {
  getCompletion: (completionArgs: CompletionArgs) => string
  isApplicable: (scanner: Scanner) => CompletionArgs | false
}

export type DoCompletion = (text: string, offset: number) => string | undefined

export const createDoCompletion: <T extends object>(
  completion: Completion<T>
) => DoCompletion = autoCompletion => (text, offset) => {
  // TODO partial get text
  const scanner = createScanner(text)
  scanner.stream.goTo(offset)
  const result = autoCompletion.isApplicable(scanner)
  if (result) {
    return autoCompletion.getCompletion(result)
  }
  return undefined
}

/**
 * Self closing tag close completion
 * `<div/` -> `<div/>`.
 */
const selfClosingTagCloseCompletion: Completion<{}> = {
  getCompletion() {
    return '>'
  },
  isApplicable(scanner) {
    if (!scanner.stream.currentlyEndsWith('/')) {
      return false
    }
    scanner.stream.goBackToUntilChar('<')
    scanner.state = ScannerState.AfterOpeningStartTag
    const token = scanner.scan()
    if (token !== TokenType.StartTag) {
      return false
    }
    return true
  },
}

/**
 * Self closing tag close completion
 * `<div/` -> `<div/>`.
 */
export const doSelfClosingTagCloseCompletion: DoCompletion = createDoCompletion(
  selfClosingTagCloseCompletion
)

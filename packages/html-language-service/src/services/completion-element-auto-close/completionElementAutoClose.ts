import { shouldHaveNewline, isSelfClosingTag } from '../../data/HTMLManager'
import { ScannerState, TokenType, createScanner } from 'html-parser'

/**
 * Completion for automatically closing elements.
 *
 * `<div>` -> `<div></div>`.
 */
export const doCompletionElementAutoClose: (
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
  if (!scanner.stream.currentlyEndsWith('>')) {
    return undefined
  }
  scanner.stream.goBack(1)
  const char = scanner.stream.raceBackUntilChars('<', '>')
  if (char !== '<') {
    return undefined
  }
  scanner.state = ScannerState.AfterOpeningStartTag
  const token = scanner.scan()
  if (token !== TokenType.StartTag) {
    return undefined
  }
  const tagName = scanner.getTokenText()
  if (isSelfClosingTag(tagName)) {
    return undefined
  }
  let completionString: string
  if (shouldHaveNewline(tagName)) {
    completionString = `\n\t$0\n</${tagName}>`
  } else {
    completionString = `$0</${tagName}>`
  }
  return {
    completionString,
    completionOffset: offset,
  }
}
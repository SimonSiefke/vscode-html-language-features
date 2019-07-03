/* eslint-disable no-param-reassign */
import { shouldHaveNewline, isSelfClosingTag } from '../../../data/HTMLManager'

import {
  DoCompletion,
  createDoCompletion,
  Completion,
} from '../htmlClosingTagCompletion'
import { ScannerState, TokenType } from 'html-parser'

/**
 * End tag auto close completion.
 * `<div>` -> `<div></div>`.
 */
const endTagAutoCloseCompletion: Completion<{
  tagName: string
}> = {
  getCompletion({ tagName }) {
    if (shouldHaveNewline(tagName)) {
      return `\n\t$0\n</${tagName}>`
    }
    return `$0</${tagName}>`
  },
  isApplicable(scanner) {
    if (!scanner.stream.currentlyEndsWith('>')) {
      return false
    }
    scanner.stream.goBack(1)
    const char = scanner.stream.raceBackUntilChars('<', '>')
    if (char !== '<') {
      return false
    }
    scanner.state = ScannerState.AfterOpeningStartTag
    const token = scanner.scan()
    if (token !== TokenType.StartTag) {
      return false
    }
    const tagName = scanner.getTokenText()
    if (isSelfClosingTag(tagName)) {
      return false
    }
    return { tagName }
  },
}

/**
 * End tag auto close completion.
 * `<div>` -> `<div></div>`.
 */
export const doEndTagAutoCloseCompletion: DoCompletion = createDoCompletion(
  endTagAutoCloseCompletion
)

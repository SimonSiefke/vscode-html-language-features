import {
  isSelfClosingTag,
  addSchema,
  shouldHaveNewline,
} from '../../../data/HTMLManager'

import {
  DoCompletion,
  createDoCompletion,
  Completion,
} from '../htmlClosingTagCompletion'
import { ScannerState, TokenType, createScanner, Scanner } from 'html-parser'
import { getParentTagName } from '../../htmlCompletion/getParentTagName'
import { expand } from '../../expand'

const getEmmetTagCompletion = (tagName: string) => {
  if (shouldHaveNewline(tagName)) {
    return `<${tagName}>\n\t$0\n</${tagName}>`
  }
  return `<${tagName}>$0</${tagName}>`
}

const emmetTagCompletion = (scanner: Scanner) => {
  if (!scanner.stream.currentlyEndsWithRegex(/[!a-zA-Z\d-]+$/)) {
    return undefined
  }
  scanner.stream.goBackToUntilChar(' ')
  const completionOffset = scanner.stream.position
  scanner.state = ScannerState.WithinContent
  scanner.scan()
  const incompleteTagName = scanner.getTokenText()
  const parent = getParentTagName(scanner, completionOffset)
  if (!parent) {
    return undefined
  }
  const tagName = expand(incompleteTagName, parent.tagName)
  if (!tagName) {
    return undefined
  }
  return {
    completionString: getEmmetTagCompletion(tagName),
    completionOffset,
  }
}

const createDoEmmetCompletion = (text: string, offset: number) => {
  const scanner = createScanner(text)
  scanner.stream.goTo(offset)
  return emmetTagCompletion(scanner)
}

export const doEmmetTagCompletion = createDoEmmetCompletion

/**
 * End tag close completion
 *`<p>this is text</` -> `<p>this is text</p>`.
 */
const endTagCloseCompletion: Completion<{ tagName: string }> = {
  getCompletion({ tagName }) {
    return `${tagName}>`
  },
  isApplicable(scanner) {
    // console.log('inside')
    if (!scanner.stream.currentlyEndsWith('</')) {
      return false
    }
    scanner.stream.goBack(3)
    let i = 0
    let tagName: string
    let stack = []
    do {
      scanner.stream.goBackToUntilChar('<')
      if (scanner.stream.position === 0) {
        return false
      }
      const { position } = scanner.stream
      scanner.state = ScannerState.AfterOpeningStartTag
      const token = scanner.scan()
      if (token !== TokenType.StartTag) {
        scanner.stream.goTo(position - 2)
        continue
      }
      tagName = scanner.getTokenText()
      if (isSelfClosingTag(tagName)) {
        scanner.stream.goTo(position - 2)
        continue
      }
    } while (i++ < 8)

    // @ts-ignore
    return { tagName }
  },
}

/**
 * End tag close completion
 *`<p>this is text</` -> `<p>this is text</p>`.
 */
export const doEndTagCloseCompletion: DoCompletion = createDoCompletion(
  endTagCloseCompletion
)

import { createScanner } from '@html-language-features/html-parser'
import { getPreviousOpeningTagName } from '../util/getParentTagName'

export type Info =
  | {
      location: 'partial-start-tag-name' // <| or <di|
      partialTagName: string
      parentTagName: string
      offset: number
    }
  | {
      location: 'whitespace-after-start-tag-open' // <div |
      tagName: string
    }
  | {
      location: 'partial-attribute-name' // <div cla|
      tagName: string
      partialAttributeName: string
    }
  | {
      location: 'attribute-equal-sign' // <div class=|
      tagName: string
      attributeName: string
    }
  | {
      location: 'attribute-value-quotes' // <div class=""
      tagName: string
      attributeName: string
      partialAttributeValue: string
    }
  | {
      location: 'self-closing' // <div /|
    }
  | {
      location: 'after-start-tag-closing-bracket' // <div>|
      tagName: string
    }
  | {
      location: 'partial-closing-tag' // <div></| or <div></di
      previousOpenTagName: string
      partialClosingTagName: string
      offset: number
    }
  | {
      location: 'inside text' // <div> p|
      previousOpenTagName: string
      previousChar: string
    }

const atStartTagRE = /<([^\s<>\/]*)$/
const partialClosingTagRE = /<\/([^\s<>\/]*)$/

export const getInfoAtOffset: (text: string, offset: number) => Info = (
  text,
  offset
) => {
  const scanner = createScanner(text, {
    initialOffset: offset,
  })
  const partialText = text.slice(0, offset)
  const atStartTagMatch = partialText.match(atStartTagRE)
  if (atStartTagMatch) {
    const partialTagName = atStartTagMatch[1]
    const previousOpenTagName = getPreviousOpeningTagName(
      scanner,
      offset - partialTagName.length - 2
    ) || {
      tagName: 'root',
      offset: 0,
    }
    return {
      location: 'partial-start-tag-name',
      offset: offset - partialTagName.length,
      parentTagName: previousOpenTagName.tagName,
      partialTagName,
    }
  }
  const partialClosingTagMatch = partialText.match(partialClosingTagRE)
  if (partialClosingTagMatch) {
    const partialClosingTagName = partialClosingTagMatch[1]
    const partialClosingTagOffset = offset - partialClosingTagName.length
    const previousOpenTagName = getPreviousOpeningTagName(
      scanner,
      scanner.stream.position - 3 - partialClosingTagName.length
    ) || {
      tagName: 'root',
    }
    return {
      location: 'partial-closing-tag',
      previousOpenTagName: previousOpenTagName.tagName,
      partialClosingTagName,
      offset: partialClosingTagOffset,
    }
  }

  const previousChar = scanner.stream.peekLeft(1) || ''

  const previousOpenTagName = getPreviousOpeningTagName(
    scanner,
    scanner.stream.position - 1
  ) || {
    tagName: 'root',
  }

  return {
    location: 'inside text',
    previousOpenTagName: previousOpenTagName.tagName,
    previousChar,
  }
}

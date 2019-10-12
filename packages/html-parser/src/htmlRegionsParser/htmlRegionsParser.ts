import {
  createScanner,
  ScannerState,
  TokenType,
} from '../htmlScanner/htmlScanner'

function isEmbeddedContent(tagName: string): boolean {
  return ['script', 'style'].includes(tagName)
}

interface Region {
  start: number
  end: number
  tagName: string
  attributes: { [key: string]: string | undefined }
}

export function parseRegions(input: string): Region[] {
  const scanner = createScanner(input)
  let token: TokenType
  const regions = []
  let currentRegion: {
    start?: number
    end?: number
    tagName?: string
    attributes: { [key: string]: string | undefined }
  } = {
    attributes: {},
  }
  let currentStartTag: string
  let currentEndTag: string
  let lastAttributeName: string
  while ((token = scanner.scan()) !== TokenType.EOS) {
    switch (token) {
      case TokenType.StartTag:
        currentStartTag = scanner.getTokenText()
        if (!isEmbeddedContent(currentStartTag)) {
          break
        }
        break
      case TokenType.StartTagClose:
        if (!isEmbeddedContent(currentStartTag!)) {
          break
        }
        currentRegion.start = scanner.getTokenEnd()
        currentRegion.tagName = currentStartTag!
        regions.push(currentRegion!)
        break
      case TokenType.AttributeName:
        if (!isEmbeddedContent(currentStartTag!)) {
          break
        }
        lastAttributeName = scanner.getTokenText()
        currentRegion.attributes[lastAttributeName] = undefined
        break
      case TokenType.AttributeValue:
        if (!isEmbeddedContent(currentStartTag)) {
          break
        }
        const attributeValue = scanner.getTokenText()
        currentRegion.attributes[lastAttributeName] = attributeValue
        break
      case TokenType.EndTag:
        currentEndTag = scanner.getTokenText()
        if (!isEmbeddedContent(currentEndTag)) {
          break
        }
        currentRegion.end = scanner.getTokenOffset() - 2 // need to go back 2 because last two char were '</'
        break
      case TokenType.EndTagClose:
        currentRegion = {
          attributes: {},
        }
        break
      default:
        break
    }
  }
  return regions
}

parseRegions('<script i>x=2<style></script><style> </style>') // ?

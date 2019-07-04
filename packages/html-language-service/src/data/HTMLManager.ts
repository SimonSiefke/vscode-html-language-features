import * as _ from 'lodash'
import { getConfig, Config } from 'schema'

interface Element {
  description?: string
  markdownDescription?: string
  'self-closing'?: boolean
  newline?: boolean
}

interface Schema {
  elements: {
    [key: string]: Element
  }
}

let htmlTags: { [key: string]: Element } = {}
let htmlTagNames: string[] = []
let htmlTagNamesDirty = false

export function addConfig(configOrAbsoluteConfigPath: Config | string): void {
  const config = getConfig(configOrAbsoluteConfigPath)
  htmlTags = config.elements
  htmlTagNamesDirty = true
}

export function getHTMLTagNames(): string[] {
  if (htmlTagNamesDirty) {
    htmlTagNames = Object.keys(htmlTags)
  }
  return htmlTagNames
}

export function getHTMLTags(): Schema['elements'] {
  return htmlTags
}

export function isSelfClosingTag(tagName: string): boolean {
  return (htmlTags[tagName] && htmlTags[tagName]['self-closing']) as boolean
}

export function shouldHaveNewline(tagName: string): boolean {
  return htmlTags[tagName] && (htmlTags[tagName].newline as boolean)
}

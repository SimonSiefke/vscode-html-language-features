import { validate } from 'jsonschema'
import * as _ from 'lodash'
import { schema } from 'schema'

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

export function addSchema(newSchema: Schema): void {
  const { errors } = validate(newSchema, schema)
  if (errors.length > 0) {
    console.error(`invalid schema: ${errors[0].message}`)
    return
  }
  htmlTags = _.merge(htmlTags, newSchema.elements)
  for (const htmlTag in htmlTags) {
    if (htmlTag.startsWith('-')) {
      delete htmlTags[htmlTag]
      delete htmlTags[htmlTag.slice(1)]
    }
  }
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

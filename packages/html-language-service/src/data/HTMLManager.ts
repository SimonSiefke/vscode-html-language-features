// import * as _ from 'lodash'
// import { getConfig, Config } from '@html-language-features/schema'

// interface Attribute {
//   description?: string
//   experimental?: boolean
//   deprecated?: boolean
// }

// interface Element {
//   description?: string
//   markdownDescription?: string
//   selfClosing?: boolean
//   newline?: boolean
//   attributes?: {
//     [key: string]: Attribute
//   }
//   reference?: {
//     url: string
//     name: string
//   }
// }

// interface Schema {
//   elements: {
//     [key: string]: Element
//   }
// }

// let htmlTags: { [key: string]: Element } = {}
// let htmlTagNames: string[] = []
// let htmlTagNamesDirty = false

// export const addConfig = (
//   configOrAbsoluteConfigPath: Config | string
// ): void => {
//   const config = getConfig(configOrAbsoluteConfigPath)
//   htmlTags = config.elements
//   htmlTagNamesDirty = true
// }

// export const getHTMLTagNames = (): string[] => {
//   if (htmlTagNamesDirty) {
//     htmlTagNames = Object.keys(htmlTags)
//   }
//   return htmlTagNames
// }

// export const getHTMLTags = (): Schema['elements'] => {
//   return htmlTags
// }

// export const isSelfClosingTag: (tagName: string) => boolean = tagName => {
//   return htmlTags[tagName] && htmlTags[tagName].selfClosing === true
// }

// export const shouldHaveNewline: (tagName: string) => boolean = tagName => {
//   return htmlTags[tagName] && htmlTags[tagName].newline === true
// }

// export const getInfoForHtmlTag = (tagName: string): Element | undefined => {
//   return htmlTags[tagName]
// }

// export const getAttributes: (
//   tagName: string
// ) => { [key: string]: Attribute } | undefined = tagName =>
//   htmlTags[tagName] && htmlTags[tagName].attributes

// export const getInfoDescriptionForHtmlTag = (
//   tagName: string
// ): string | undefined => {
//   return htmlTags[tagName] && htmlTags[tagName].description
// }

// export const getInfoReference = (
//   tagName: string
// ):
//   | {
//       url: string
//       name: string
//     }
//   | undefined => {
//   console.log('grt ref info')
//   console.log(htmlTags[tagName] && htmlTags[tagName].reference)
//   return htmlTags[tagName] && htmlTags[tagName].reference
// }

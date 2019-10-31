import {
  Config,
  mergeConfigs,
  ValidationError,
} from '@html-language-features/schema'
import {
  Reference,
  Attribute,
  Element,
  AttributeValue,
} from '@html-language-features/schema/src/Config'
import * as fs from 'fs'
import * as path from 'path'

const DEBUGConfig = () => {
  fs.writeFileSync(
    path.join(__dirname, '../../tmp-config.json'),
    JSON.stringify(_config, null, 2)
  )
}

let _config: Config = {}

export const setConfig: (
  config: Config
) => { errors: ValidationError[] } = config => {
  const result = mergeConfigs(config)
  if ('errors' in result) {
    return result
  }
  _config = result
  return {
    errors: [],
  }
}

export const addConfigs: (
  ...configs: Config[]
) => { errors: ValidationError[] } = (...configs) => {
  const result = mergeConfigs(_config, ...configs)
  if ('errors' in result) {
    return result
  }
  _config = result
  // DEBUGConfig()
  return { errors: [] }
}

export const isSelfClosingTag: (tagName: string) => boolean = tagName =>
  _config.elements !== undefined &&
  _config.elements[tagName] !== undefined &&
  _config.elements[tagName].selfClosing === true

export const shouldHaveNewline: (tagName: string) => boolean = tagName =>
  _config.elements !== undefined &&
  _config.elements[tagName] !== undefined &&
  _config.elements[tagName].newline === true

export const getReferenceForTag: (
  tagName: string
) => Reference | undefined = tagName =>
  _config.elements &&
  _config.elements[tagName] &&
  _config.elements[tagName].reference

export const getDescriptionForTag: (
  tagName: string
) => string | undefined = tagName =>
  _config.elements &&
  _config.elements[tagName] &&
  _config.elements[tagName].description

export const getReferenceForAttributeName: (
  tagName: string | undefined,
  attributeName: string
) => Reference | undefined = (tagName, attributeName) => {
  if (!tagName) {
    return undefined
  }
  return (
    _config.elements &&
    _config.elements[tagName] &&
    _config.elements[tagName].attributes &&
    _config.elements[tagName].attributes![attributeName] &&
    _config.elements[tagName].attributes![attributeName].reference
  )
}

export const getDescriptionForAttributeName: (
  tagName: string | undefined,
  attributeName: string
) => string | undefined = (tagName, attributeName) => {
  if (tagName === undefined) {
    // TODO global attributes
    return undefined
  }
  return (
    _config.elements &&
    _config.elements[tagName] &&
    _config.elements[tagName].attributes &&
    // TODO typescript bug?
    _config.elements[tagName].attributes![attributeName] &&
    _config.elements[tagName].attributes![attributeName].description
  )
}

export const getDescriptionForAttributeValue: (
  tagName: string,
  attributeName: string,
  attributeValue:string
) => string | undefined = (tagName, attributeName, attributeValue) => {
  if (tagName === undefined) {
    // TODO global attributes
    return undefined
  }
  return (
    _config.elements &&
    _config.elements[tagName] &&
    _config.elements[tagName].attributes &&
    // TODO typescript bug?
    _config.elements[tagName].attributes![attributeName] &&
    _config.elements[tagName].attributes![attributeName].options &&
    _config.elements[tagName].attributes![attributeName].options![attributeValue] &&
    _config.elements[tagName].attributes![attributeName].options![attributeValue].description
  )
}

export const isTagName: (tagName: string) => boolean = tagName =>
  _config.elements !== undefined && _config.elements[tagName] !== undefined

export type NamedTag = Element & { readonly name: string }

export type NamedAttribute = Attribute & { readonly name: string }

export type NamedAttributeValue = AttributeValue & { readonly name: string }

/**
 * Get the most likely attribute values for a given tag and attribute
 * @param tagName
 * @param attributeName
 * @example
 * getSuggestedAttributeValues('a', 'target') // [{ name: '_blank', probability: 0.2 }, { name: '_self' }, ...]
 */
export const getSuggestedAttributeValues: (
  tagName: string,
  attributeName: string
) => NamedAttributeValue[] | undefined = (tagName, attributeName) => {
  const options =
    _config.elements &&
    _config.elements[tagName] &&
    _config.elements[tagName].attributes &&
    _config.elements[tagName].attributes![attributeName] &&
    _config.elements[tagName].attributes![attributeName].options
  if (!options) {
    return undefined
  }
  return Object.entries(options).map(([key, value]) => ({
    name: key,
    ...value,
  }))
}

/**
 * Get the most likely tags for a given parent tag.
 * @example
 * getStatisticsForParentTag('ul') // { li: { probability: 1 }}
 */
export const getSuggestedTags: (
  parentTagName: string
) => NamedTag[] | undefined = parentTagName => {
  const allowedChildren =
    _config.elements &&
    _config.elements[parentTagName] &&
    _config.elements[parentTagName].allowedChildren
  if (!allowedChildren) {
    return undefined
  }
  return Object.entries(allowedChildren).map(([key, value]) => ({
    name: key,
    ...value,
  }))
}

/**
 * Get the most likely attributes for a given tag.
 * @example
 * getSuggestedAttributes('option') // { value: { probability: 0.95 }}
 */
export const getSuggestedAttributes: (
  tagName: string
) => NamedAttribute[] | undefined = tagName => {
  const attributes =
    _config.elements &&
    _config.elements[tagName] &&
    _config.elements[tagName].attributes
  if (!attributes) {
    return undefined
  }
  return Object.entries(attributes).map(([key, value]) => ({
    name: key,
    ...value,
  }))
}

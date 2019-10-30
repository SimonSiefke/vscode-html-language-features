import {
  Config,
  mergeConfigs,
  ValidationError,
} from '@html-language-features/schema'
import { Reference } from '@html-language-features/schema/src/Config'
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
  if (!tagName) {
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

export const isTagName: (tagName: string) => boolean = tagName =>
  _config.elements !== undefined && _config.elements[tagName] !== undefined

export type SuggestedTag = {
  probability?: number
  name: string
}

export interface SuggestedAttribute {
  probability?: number
  name: string
}

/**
 * Get the most likely tags for a given parent tag.
 * @example
 * getStatisticsForParentTag('ul') // { li: { probability: 1 }}
 */
export const getSuggestedTags: (
  parentTagName: string
) => SuggestedTag[] | undefined = parentTagName => {
  const elements =
    _config.elements &&
    _config.elements[parentTagName] &&
    _config.elements[parentTagName].allowedChildren
  if (!elements) {
    return undefined
  }
  return Object.entries(elements).map(([key, value]) => ({
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
) => SuggestedAttribute[] | undefined = tagName => {
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

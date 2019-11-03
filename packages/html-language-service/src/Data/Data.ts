import {
  AttributeInfo,
  AttributeValueInfo,
  Config,
  mergeConfigs,
  Reference,
  ValidationError,
  SubTag,
  Category,
  resolveConfig,
} from '@html-language-features/schema'
import * as fs from 'fs'
import * as path from 'path'

// TODO probably better to return empty array instead of undefined

const DEBUGConfig = () => {
  console.log('debug')
  fs.writeFileSync(
    path.join(__dirname, '../../tmp-config.json'),
    JSON.stringify(_config, null, 2)
  )
}

let _config: Config = {}
let _configs: Set<Config> = new Set()

export const setConfigs: (
  ...config: Config[]
) => { errors: ValidationError[] } = (...configs) => {
  const result = mergeConfigs(...configs)
  if ('errors' in result) {
    return result
  }
  _config = result
  return {
    errors: [],
  }
}

export const resetConfig: () => void = () => {
  _config = {}
}

class InvalidConfigError extends Error {}

export const addConfigs: (...configs: Config[]) => Promise<void> = async (
  ...configs
) => {
  const resolvedConfigs = await Promise.all(
    configs.map(async config => {
      if (config.extends) {
        const otherConfig = await resolveConfig(config.extends)
        const result = mergeConfigs(config, otherConfig)
        if ('errors' in result) {
          throw new Error('invalid config')
        }
      }
      return config
    })
  )
  const result = mergeConfigs(_config, ...resolvedConfigs)
  if ('errors' in result) {
    throw new Error('invalid config')
  }
  _config = result
}

export const removeConfigs: (...configs: Config[]) => void = (...configs) => {
  for (const config of configs) {
    if (!_configs.has(config)) {
      throw new Error("config doesn't exist")
    }
    _configs.delete(config)
  }
  setConfigs(..._configs)
}

export const isSelfClosingTag: (tagName: string) => boolean = tagName =>
  _config.tags !== undefined &&
  _config.tags[tagName] !== undefined &&
  _config.tags[tagName].selfClosing === true

export const isDeprecatedTag: (tagName: string) => boolean = tagName =>
  _config.tags !== undefined &&
  _config.tags[tagName] !== undefined &&
  _config.tags[tagName].deprecated === true

export const shouldHaveNewline: (tagName: string) => boolean = tagName =>
  _config.tags !== undefined &&
  _config.tags[tagName] !== undefined &&
  _config.tags[tagName].newline === true

export const getReferenceForTag: (
  tagName: string
) => Reference | undefined = tagName =>
  _config.tags && _config.tags[tagName] && _config.tags[tagName].reference

export const getDescriptionForTag: (
  tagName: string
) => string | undefined = tagName =>
  _config.tags && _config.tags[tagName] && _config.tags[tagName].description

export const getReferenceForAttributeName: (
  tagName: string,
  attributeName: string
) => Reference | undefined = (tagName, attributeName) => {
  const elementAttributeReference =
    _config.tags &&
    _config.tags[tagName] &&
    _config.tags[tagName].attributes &&
    _config.tags[tagName].attributes![attributeName] &&
    _config.tags[tagName].attributes![attributeName].reference
  if (elementAttributeReference) {
    return elementAttributeReference
  }
  return (
    _config.globalAttributes &&
    _config.globalAttributes[attributeName] &&
    _config.globalAttributes[attributeName].reference
  )
}

export const getDescriptionForAttributeName: (
  tagName: string,
  attributeName: string
) => string | undefined = (tagName, attributeName) => {
  const elementAttributeDescription =
    _config.tags &&
    _config.tags[tagName] &&
    _config.tags[tagName].attributes &&
    _config.tags[tagName].attributes[attributeName] &&
    _config.tags[tagName].attributes[attributeName].description
  if (elementAttributeDescription) {
    return elementAttributeDescription
  }
  return (
    _config.globalAttributes &&
    _config.globalAttributes[attributeName] &&
    _config.globalAttributes[attributeName].description
  )
}

export const getDescriptionForAttributeValue: (
  tagName: string,
  attributeName: string,
  attributeValue: string
) => string | undefined = (tagName, attributeName, attributeValue) => {
  const elementAttributeValueDescription =
    _config.tags &&
    _config.tags[tagName] &&
    _config.tags[tagName].attributes &&
    _config.tags[tagName].attributes[attributeName] &&
    _config.tags[tagName].attributes[attributeName].options &&
    _config.tags[tagName].attributes[attributeName].options![attributeValue] &&
    _config.tags[tagName].attributes[attributeName].options![attributeValue]
      .description

  if (elementAttributeValueDescription) {
    return elementAttributeValueDescription
  }
  return (
    _config.globalAttributes &&
    _config.globalAttributes[attributeName] &&
    _config.globalAttributes[attributeName].options &&
    _config.globalAttributes[attributeName].options[attributeValue] &&
    _config.globalAttributes[attributeName].options[attributeValue].description
  )
}

export const isTagName: (tagName: string) => boolean = tagName =>
  _config.tags !== undefined && _config.tags[tagName] !== undefined

export type NamedTag = { readonly name: string }

export type NamedAttribute = AttributeInfo & { readonly name: string }

export type NamedAttributeValue = AttributeValueInfo & { readonly name: string }

export type NamedSnippet = { readonly name: string; value: string }

const toNamed: <T extends object>(values: {
  [key: string]: T
}) => (T & { name: string })[] = values => {
  return Object.entries(values).map(([key, value]) => ({
    name: key,
    ...value,
  }))
}

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
  const elementAttributeValues =
    _config.tags &&
    _config.tags[tagName] &&
    _config.tags[tagName].attributes &&
    _config.tags[tagName].attributes![attributeName] &&
    _config.tags[tagName].attributes![attributeName].options
  if (elementAttributeValues) {
    return toNamed(elementAttributeValues)
  }
  const globalAttributeValues =
    _config.globalAttributes &&
    _config.globalAttributes[attributeName] &&
    _config.globalAttributes[attributeName].options
  if (globalAttributeValues) {
    return toNamed(globalAttributeValues)
  }
  return undefined
}

const getTagsByCategory: (category: Category) => string[] = category => {
  return Object.entries(_config.tags || {})
    .filter(([key, value]) => {
      if (!value.categories) {
        return false
      }
      return value.categories.includes(category)
    })
    .map(([key, value]) => key)
}

const matchesTagOrCategory: (
  tagName: string,
  tagOrCategory: SubTag
) => boolean = (tagName, tagOrCategory) => {
  if (typeof tagOrCategory === 'string') {
    return tagName === tagOrCategory
  }
  return getTagsByCategory(tagOrCategory.category).includes(tagName)
}

/**
 * Whether or not a parent tag is allowed for a sub tag
 * @example
 * isAllowedParentTag('html', 'body') // true
 */
const isAllowedParentTag: (
  parentTagName: string,
  subTagName: string
) => boolean = (parentTagName, subTagName) => {
  const allowedParentTags =
    _config.tags &&
    _config.tags[subTagName] &&
    _config.tags[subTagName].allowedParentTags
  if (!allowedParentTags) {
    return true
  }
  return allowedParentTags.includes(parentTagName)
}

/**
 * Whether or not a sub tag is a allowed sub tag
 * @example
 * isAllowedSubTag('ul', 'li') // true
 */
const isAllowedSubTag: (
  parentTagName: string,
  subTagName: string
) => boolean = (parentTagName, subTagName) => {
  const allowedSubTags =
    _config.tags &&
    _config.tags[parentTagName] &&
    _config.tags[parentTagName].allowedSubTags
  if (!allowedSubTags) {
    return true
  }
  return allowedSubTags.some(subTagOrCategory =>
    matchesTagOrCategory(subTagName, subTagOrCategory)
  )
}

/**
 * Whether or not a sub tag is a deep disallowed sub tag
 * @example
 * isDeepDisallowedSubTag('a', 'a') // true
 */
const isDeepDisallowedSubTag: (
  parentTagName: string,
  subTagName: string
) => boolean = (parentTagName, subTagName) => {
  const deepDisallowedSubTags =
    _config.tags &&
    _config.tags[parentTagName] &&
    _config.tags[parentTagName].deepDisallowedSubTags
  if (!deepDisallowedSubTags) {
    return false
  }
  return deepDisallowedSubTags.some(subTagOrCategory =>
    matchesTagOrCategory(subTagName, subTagOrCategory)
  )
}

/**
 * Get the most likely tags for a given parent tag.
 * @example
 * getSuggestedTags('ul') // [{ name: 'li' }]
 */
export const getSuggestedTags: (
  parentTagName: string
) => string[] = parentTagName => {
  return Object.keys(_config.tags || {}).filter(
    tagName =>
      isAllowedSubTag(parentTagName, tagName) &&
      isAllowedParentTag(parentTagName, tagName) &&
      !isDeepDisallowedSubTag(parentTagName, tagName)
  )
}

/**
 * Get the most likely attributes for a given tag.
 * @example
 * getSuggestedAttributes('option') // { value: { probability: 0.95 }}
 */
export const getSuggestedAttributes: (
  tagName: string
) => NamedAttribute[] | undefined = tagName => {
  const elementAttributes =
    _config.tags && _config.tags[tagName] && _config.tags[tagName].attributes
  const globalAttributes = _config && _config.globalAttributes
  if (!elementAttributes && !globalAttributes) {
    return undefined
  }
  const mergedAttributes = {
    ...(elementAttributes || {}),
    ...(globalAttributes || {}),
  }

  return Object.entries(mergedAttributes)
    .filter(([key]) => !key.startsWith('-'))
    .map(([key, value]) => ({
      name: key,
      ...value,
    }))
}

import {
  AttributeInfo,
  AttributeValueInfo,
  Config,
  mergeConfigs,
  Reference,
  ValidationError,
  SubTag,
  Category,
  resolveConfig as resolveConfigByUrl,
  AttributeType,
} from '@html-language-features/schema'
import * as fs from 'fs'
import * as path from 'path'

// TODO probably better to return empty array instead of undefined

const DEBUGConfig = () => {
  console.log('debug')
  fs.writeFileSync(
    path.join(__dirname, '../../tmp-config.json'),
    JSON.stringify(_mergedConfig, null, 2)
  )
}

/**
 * Map of id's and resolved configs.
 *
 */
const _resolvedConfigs: Map<string, Config[]> = new Map()

/**
 * The final resolved Config. Computed from `_resolvedConfigs`
 */
let _mergedConfig: Config = {}

/**
 * Updates `_mergedConfig`. Must be called whenever `_resolvedConfig` changes.
 */
const updateMergedConfig: () => void = () => {
  const allConfigs = Array.from(_resolvedConfigs.values()).flat()
  const result = mergeConfigs(...allConfigs)
  if ('errors' in result) {
    return result
  }
  _mergedConfig = result
}

const resolveConfig: (config: Config) => Promise<Config[]> = async config => {
  const otherConfigs = await Promise.all(
    (config.extends || [])
      .filter(extendUrl => extendUrl.startsWith('https'))
      .map(resolveConfigByUrl)
  )
  return [config, ...otherConfigs]
}

const resolveAllConfigs: (
  configs: Config[]
) => Promise<Config[]> = async configs => {
  const result = await Promise.all(configs.map(resolveConfig))
  return result.flat()
}

export const replaceConfigs: (
  configs: Config[],
  id: string
) => Promise<void> = async (configs, id) => {
  const resolvedConfigs = await resolveAllConfigs(configs)
  _resolvedConfigs.set(id, resolvedConfigs)
  updateMergedConfig()
}

export const resetConfigs: () => void = () => {
  _resolvedConfigs.clear()
  updateMergedConfig()
}

// TODO
class InvalidConfigError extends Error {}

export const isSelfClosingTag: (tagName: string) => boolean = tagName => {
  return (
    _mergedConfig.tags !== undefined &&
    _mergedConfig.tags[tagName] !== undefined &&
    _mergedConfig.tags[tagName].selfClosing === true
  )
}

export const isDeprecatedTag: (tagName: string) => boolean = tagName =>
  _mergedConfig.tags !== undefined &&
  _mergedConfig.tags[tagName] !== undefined &&
  _mergedConfig.tags[tagName].deprecated === true

export const isDeprecatedAttribute: (
  tagName: string,
  attributeName: string
) => boolean = (tagName, attributeName) => {
  const elementAttributeDeprecated =
    _mergedConfig.tags &&
    _mergedConfig.tags[tagName] &&
    _mergedConfig.tags[tagName].attributes &&
    _mergedConfig.tags[tagName].attributes[attributeName] &&
    _mergedConfig.tags[tagName].attributes[attributeName].deprecated === true
  if (elementAttributeDeprecated) {
    return elementAttributeDeprecated
  }
  return (
    _mergedConfig.globalAttributes &&
    _mergedConfig.globalAttributes[attributeName] &&
    _mergedConfig.globalAttributes[attributeName].deprecated === true
  )
}

export const isDeprecatedAttributeValue: (
  tagName: string,
  attributeName: string,
  attributeValue: string
) => boolean = (tagName, attributeName, attributeValue) => {
  const elementAttributeValueDeprecated =
    _mergedConfig.tags &&
    _mergedConfig.tags[tagName] &&
    _mergedConfig.tags[tagName].attributes &&
    _mergedConfig.tags[tagName].attributes[attributeName] &&
    _mergedConfig.tags[tagName].attributes[attributeName].options &&
    _mergedConfig.tags[tagName].attributes[attributeName].options[
      attributeValue
    ] &&
    _mergedConfig.tags[tagName].attributes[attributeName].options[
      attributeValue
    ].deprecated === true
  if (elementAttributeValueDeprecated) {
    return true
  }
  return (
    _mergedConfig.globalAttributes &&
    _mergedConfig.globalAttributes[attributeName] &&
    _mergedConfig.globalAttributes[attributeName].options &&
    _mergedConfig.globalAttributes[attributeName].options[attributeValue] &&
    _mergedConfig.globalAttributes[attributeName].options[attributeValue]
      .deprecated === true
  )
}

export const shouldHaveNewline: (tagName: string) => boolean = tagName => {
  if (!_mergedConfig.tags) {
    return true
  }
  if (!_mergedConfig.tags[tagName]) {
    return true
  }
  if (_mergedConfig.tags[tagName].newline === undefined) {
    return true
  }
  return _mergedConfig.tags[tagName].newline === true
}

export const getReferenceForTag: (
  tagName: string
) => Reference | undefined = tagName =>
  _mergedConfig.tags &&
  _mergedConfig.tags[tagName] &&
  _mergedConfig.tags[tagName].reference

export const getDescriptionForTag: (
  tagName: string
) => string | undefined = tagName =>
  _mergedConfig.tags &&
  _mergedConfig.tags[tagName] &&
  _mergedConfig.tags[tagName].description

export const getReferenceForAttributeName: (
  tagName: string,
  attributeName: string
) => Reference | undefined = (tagName, attributeName) => {
  const elementAttributeReference =
    _mergedConfig.tags &&
    _mergedConfig.tags[tagName] &&
    _mergedConfig.tags[tagName].attributes &&
    _mergedConfig.tags[tagName].attributes![attributeName] &&
    _mergedConfig.tags[tagName].attributes![attributeName].reference
  if (elementAttributeReference) {
    return elementAttributeReference
  }
  return (
    _mergedConfig.globalAttributes &&
    _mergedConfig.globalAttributes[attributeName] &&
    _mergedConfig.globalAttributes[attributeName].reference
  )
}

export const getDescriptionForAttributeName: (
  tagName: string,
  attributeName: string
) => string | undefined = (tagName, attributeName) => {
  const elementAttributeDescription =
    _mergedConfig.tags &&
    _mergedConfig.tags[tagName] &&
    _mergedConfig.tags[tagName].attributes &&
    _mergedConfig.tags[tagName].attributes[attributeName] &&
    _mergedConfig.tags[tagName].attributes[attributeName].description
  if (elementAttributeDescription) {
    return elementAttributeDescription
  }
  return (
    _mergedConfig.globalAttributes &&
    _mergedConfig.globalAttributes[attributeName] &&
    _mergedConfig.globalAttributes[attributeName].description
  )
}

export const getDescriptionForAttributeValue: (
  tagName: string,
  attributeName: string,
  attributeValue: string
) => string | undefined = (tagName, attributeName, attributeValue) => {
  const elementAttributeValueDescription =
    _mergedConfig.tags &&
    _mergedConfig.tags[tagName] &&
    _mergedConfig.tags[tagName].attributes &&
    _mergedConfig.tags[tagName].attributes[attributeName] &&
    _mergedConfig.tags[tagName].attributes[attributeName].options &&
    _mergedConfig.tags[tagName].attributes[attributeName].options![
      attributeValue
    ] &&
    _mergedConfig.tags[tagName].attributes[attributeName].options![
      attributeValue
    ].description

  if (elementAttributeValueDescription) {
    return elementAttributeValueDescription
  }
  return (
    _mergedConfig.globalAttributes &&
    _mergedConfig.globalAttributes[attributeName] &&
    _mergedConfig.globalAttributes[attributeName].options &&
    _mergedConfig.globalAttributes[attributeName].options[attributeValue] &&
    _mergedConfig.globalAttributes[attributeName].options[attributeValue]
      .description
  )
}

export const isTagName: (tagName: string) => boolean = tagName =>
  _mergedConfig.tags !== undefined && _mergedConfig.tags[tagName] !== undefined

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
) => string[] | undefined = (tagName, attributeName) => {
  const elementAttributeValues =
    _mergedConfig.tags &&
    _mergedConfig.tags[tagName] &&
    _mergedConfig.tags[tagName].attributes &&
    _mergedConfig.tags[tagName].attributes![attributeName] &&
    _mergedConfig.tags[tagName].attributes![attributeName].options
  if (elementAttributeValues) {
    return Object.keys(elementAttributeValues)
  }
  const globalAttributeValues =
    _mergedConfig.globalAttributes &&
    _mergedConfig.globalAttributes[attributeName] &&
    _mergedConfig.globalAttributes[attributeName].options
  if (globalAttributeValues) {
    return Object.keys(globalAttributeValues)
  }
  return undefined
}

export const getAttributeType: (
  tagName: string,
  attributeName: string
) => AttributeType | undefined = (tagName, attributeName) => {
  const elementAttributeType =
    _mergedConfig.tags &&
    _mergedConfig.tags[tagName] &&
    _mergedConfig.tags[tagName].attributes &&
    _mergedConfig.tags[tagName].attributes[attributeName] &&
    _mergedConfig.tags[tagName].attributes[attributeName].type
  if (elementAttributeType) {
    return elementAttributeType
  }
  const globalAttributeType =
    _mergedConfig.globalAttributes &&
    _mergedConfig.globalAttributes[attributeName] &&
    _mergedConfig.globalAttributes[attributeName].type
  if (globalAttributeType) {
    return globalAttributeType
  }
  return undefined
}

const getTagsByCategory: (category: Category) => string[] = category => {
  return Object.entries(_mergedConfig.tags || {})
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
    _mergedConfig.tags &&
    _mergedConfig.tags[subTagName] &&
    _mergedConfig.tags[subTagName].allowedParentTags
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
    _mergedConfig.tags &&
    _mergedConfig.tags[parentTagName] &&
    _mergedConfig.tags[parentTagName].allowedSubTags
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
    _mergedConfig.tags &&
    _mergedConfig.tags[parentTagName] &&
    _mergedConfig.tags[parentTagName].deepDisallowedSubTags
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
  return Object.keys(_mergedConfig.tags || {}).filter(
    tagName =>
      isAllowedSubTag(parentTagName, tagName) &&
      isAllowedParentTag(parentTagName, tagName) &&
      !isDeepDisallowedSubTag(parentTagName, tagName)
  )
}

/**
 * Get the most likely attributes for a given tag.
 * @example
 * getSuggestedAttributes('option') // ['value']
 */
export const getSuggestedAttributes: (
  tagName: string
) => string[] = tagName => {
  const elementAttributes =
    _mergedConfig.tags &&
    _mergedConfig.tags[tagName] &&
    _mergedConfig.tags[tagName].attributes
  const globalAttributes = _mergedConfig && _mergedConfig.globalAttributes
  const mergedAttributes = {
    ...(elementAttributes || {}),
    ...(globalAttributes || {}),
  }
  return Object.keys(mergedAttributes).filter(key => !key.startsWith('-'))
}

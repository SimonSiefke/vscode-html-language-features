import {
  AttributeInfo,
  AttributeValueInfo,
  Config,
  mergeConfigs,
  Reference,
  Tag,
  ValidationError,
  ParentTag,
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

export const resetConfig: () => void = () => {
  _config = {}
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

const getTagsByCategory: (category: string) => string[] = category => {
  const globalTags = _config.tags
  if (globalTags === undefined) {
    return []
  }
  return Object.entries(globalTags)
    .filter(([key, value]) => {
      if (!value.categories) {
        return false
      }
      return value.categories.includes(category)
    })
    .map(([key, value]) => key)
}

const isAllowedParentTag: (
  parentTagCandidateName: string,
  allowedParentTags: ParentTag[],
  disallowedParentTags: ParentTag[]
) => boolean = (
  parentTagCandidateName,
  allowedParentTags,
  disallowedParentTags
) => {
  const categories =
    (_config.tags &&
      _config.tags[parentTagCandidateName] &&
      _config.tags[parentTagCandidateName].categories) ||
    []

  // TODO bring into order

  let allowed: boolean
  if (allowedParentTags === undefined) {
    allowed = true
  } else {
    for (const parentTag of allowedParentTags) {
      if (typeof parentTag === 'string') {
        if (parentTag === parentTagCandidateName) {
          allowed = true
          break
        }
      } else {
        if (categories.includes(parentTag.category)) {
          allowed = true
          break
        }
      }
    }
  }
  if (allowed === false) {
    return false
  }
  if (disallowedParentTags === undefined) {
    return allowed
  }
  for (const parentTag of disallowedParentTags) {
    if (typeof parentTag === 'string') {
      if (parentTagCandidateName === parentTag) {
        return false
      }
    } else {
      if (categories.includes(parentTag.category)) {
        return false
      }
    }
  }
  return allowed
}

/**
 * Get the most likely tags for a given parent tag.
 * @example
 * getSuggestedTags('ul') // [{ name: 'li' }]
 */
export const getSuggestedTags: (
  parentTagName: string
) => NamedTag[] | undefined = parentTagName => {
  const filterTags: (tags: string[]) => string[] = tags =>
    tags.filter(tagName => {
      const allowedParentTags =
        _config.tags &&
        _config.tags[tagName] &&
        _config.tags[tagName].allowedParentTags
      const disAllowedParentTags =
        _config.tags &&
        _config.tags[tagName] &&
        _config.tags[tagName].disallowedParentTags
      return isAllowedParentTag(
        parentTagName,
        allowedParentTags,
        disAllowedParentTags
      )
    })
  const subTagsOrCategories =
    _config.tags &&
    _config.tags[parentTagName] &&
    _config.tags[parentTagName].allowedSubTags
  if (subTagsOrCategories !== undefined) {
    const allSubTags = subTagsOrCategories.flatMap(subTagOrCategory => {
      let tags: string[]
      if (typeof subTagOrCategory === 'string') {
        tags = [subTagOrCategory]
      } else {
        tags = getTagsByCategory(subTagOrCategory.category)
      }
      return tags
    })
    const filteredSubTags = filterTags(allSubTags)
    if (filteredSubTags.length === 0) {
      return undefined
    }
    return filteredSubTags.map(subTag => ({
      name: subTag,
    }))
  }
  const globalTags = Object.keys(_config.tags || {})
  const filteredGlobalTags = filterTags(globalTags)
  if (filteredGlobalTags.length === 0) {
    return undefined
  }
  return filteredGlobalTags.map(name => ({
    name,
  }))
}

export const getSuggestedSnippets: (
  parentTagName: string
) => NamedSnippet[] | undefined = parentTagName => {
  const snippets = _config.snippets
  if (snippets === undefined) {
    return undefined
  }
  return Object.entries(snippets).map(([key, value]) => ({
    name: key,
    value,
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

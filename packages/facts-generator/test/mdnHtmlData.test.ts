import axios from 'axios'
import { Config } from '@html-language-features/schema'
import _mdnConfig from '../generated/mdn.htmlData.json'
import _mdnGlobalAttributesConfig from '../generated/mdnGlobalAttributes.htmlData.json'

const mdnConfig = _mdnConfig as Config
const mdnGlobalAttributesConfig = _mdnGlobalAttributesConfig as Config

test('empty elements', () => {
  const emptyTags = [
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr',
    'command',
    'keygen',
    'menuitem',
  ]
  for (const emptyTag of emptyTags) {
    expect(mdnConfig.tags).toHaveProperty(emptyTag)
    expect(mdnConfig.tags[emptyTag]).toHaveProperty('selfClosing', true)
  }
})

test('deprecated elements', () => {
  expect(mdnConfig.tags.noframes.deprecated).toBe(true)
})

test.skip('descriptions', () => {
  for (const [key, value] of Object.entries(mdnConfig.tags)) {
    expect(value).toHaveProperty('description')
  }
})

test.skip('reference links', async () => {
  for (const tag of Object.values(mdnConfig.tags)) {
    if (tag.reference) {
      const result = await axios.get(tag.reference.url)
      expect(result).toBeDefined()
    }
  }
}, 100000)

test('input', () => {
  const expectedAttributes = [
    'autocomplete',
    'autofocus',
    'disabled',
    'form',
    'list',
    'name',
    'readonly',
    'required',
    'tabindex',
    'type',
    'value',
  ]
  for (const attribute of expectedAttributes) {
    expect(mdnConfig.tags.input.attributes).toHaveProperty(attribute)
  }
})

test('img#importance', () => {
  expect(Object.keys(mdnConfig.tags.img.attributes.importance.options)).toEqual(
    ['auto', 'high', 'low']
  )
})

test('a#target', () => {
  expect(Object.keys(mdnConfig.tags.a.attributes.target.options)).toEqual([
    '_self',
    '_blank',
    '_parent',
    '_top',
  ])
})

test.skip('global attributes', () => {
  const spellcheck = mdnGlobalAttributesConfig.globalAttributes.spellcheck
  expect(spellcheck).toHaveProperty('description')
  expect(spellcheck.options).toHaveProperty('true')
  expect(spellcheck.options).toHaveProperty('false')

  const dropzone = mdnGlobalAttributesConfig.globalAttributes.spellcheck
  expect(dropzone).toHaveProperty('description')
  expect(dropzone.options).toHaveProperty('copy')
  expect(dropzone.options).toHaveProperty('move')
  expect(dropzone.options).toHaveProperty('link')
})

test.skip('referrerpolicy', () => {
  const attributeValues = [
    'no-referrer',
    'no-referrer-when-downgrade',
    'origin',
    'origin-when-cross-origin',
    'same-origin',
    'strict-origin',
    'strict-origin-when-cross-origin',
    'unsafe-url',
  ]
  const tagsWithRefererPolicy = ['a', 'area', 'img', 'iframe', 'link']
  for (const tag of tagsWithRefererPolicy) {
    for (const attributeValue of attributeValues) {
      expect(
        mdnConfig.tags[tag].attributes.referrerpolicy.options
      ).toHaveProperty(attributeValue)
    }
  }
})
import axios from 'axios'
import { Config } from '@html-language-features/schema'
// @ts-ignore
import _mdnConfig from '../generated/mdn.htmlData.json'

const mdnConfig = _mdnConfig as Config

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

test('descriptions', () => {
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

test('boolean attributes', () => {
  const booleanAttributes = [
    'button/disabled',
    'input/checked',
    'input/multiple',
    'keygen/autofocus',
    'ol/reversed',
    'optgroup/disabled',
    'option/disabled',
    'option/selected',
    'script/async',
    'ul/compact',
  ]
  for (const booleanAttribute of booleanAttributes) {
    const [tagName, attributeName] = booleanAttribute.split('/')
    expect(mdnConfig.tags[tagName].attributes[attributeName]).toHaveProperty(
      'type',
      'boolean'
    )
  }
})

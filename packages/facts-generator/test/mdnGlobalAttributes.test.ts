import { Config } from '@html-language-features/schema'
// @ts-ignore
import _mdnGlobalAttributesConfig from '../generated/mdnGlobalAttributes.htmlData.json'

const mdnGlobalAttributesConfig = _mdnGlobalAttributesConfig as Config

test('global attributes - spellcheck', () => {
  const spellcheck = mdnGlobalAttributesConfig.globalAttributes.spellcheck
  expect(spellcheck).toHaveProperty('description')
  expect(spellcheck.options).toHaveProperty('true')
  expect(spellcheck.options).toHaveProperty('false')
})

test('global attributes - dropzone', () => {
  const dropzone = mdnGlobalAttributesConfig.globalAttributes.dropzone
  expect(dropzone).toHaveProperty('description')
  expect(dropzone.options).toHaveProperty('copy')
  expect(dropzone.options).toHaveProperty('move')
  expect(dropzone.options).toHaveProperty('link')
})

test.skip('global attributes - autocapitalize', () => {
  const autocapitalize =
    mdnGlobalAttributesConfig.globalAttributes.autocapitalize
  expect(autocapitalize).toHaveProperty('description')
  expect(autocapitalize.options).toHaveProperty('off')
  expect(autocapitalize.options).toHaveProperty('none')
  expect(autocapitalize.options).toHaveProperty('on')
  expect(autocapitalize.options).toHaveProperty('sentences')
  expect(autocapitalize.options).toHaveProperty('words')
  expect(autocapitalize.options).toHaveProperty('characters')
})

test('global attributes - contenteditable', () => {
  const contenteditable =
    mdnGlobalAttributesConfig.globalAttributes.contenteditable
  expect(contenteditable).toHaveProperty('description')
  expect(contenteditable.options).toHaveProperty('true')
  expect(contenteditable.options).toHaveProperty('false')
})

test.skip('global attributes - hidden', () => {
  const hidden = mdnGlobalAttributesConfig.globalAttributes.hidden
  expect(hidden).toHaveProperty('description')
  expect(hidden.type).toBe('boolean')
})

test('global attributes - dir', () => {
  const dir = mdnGlobalAttributesConfig.globalAttributes.dir
  expect(dir).toHaveProperty('description')
  expect(dir.options).toHaveProperty('ltr')
  expect(dir.options).toHaveProperty('rtl')
  expect(dir.options).toHaveProperty('auto')
})

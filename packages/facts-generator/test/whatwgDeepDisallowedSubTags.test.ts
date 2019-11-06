import { Config } from '@html-language-features/schema'
import _whatwgDeepDisallowedSubTagsConfig from '../generated/whatwgDeepDisallowedSubTags.htmlData.json'

const whatwgDeepDisallowedSubTagsConfig = _whatwgDeepDisallowedSubTagsConfig as Config

test('a', () => {
  expect(whatwgDeepDisallowedSubTagsConfig.tags).toHaveProperty('a', {
    deepDisallowedSubTags: [
      {
        category: 'interactive content',
      },
      'a',
    ],
  })
})

test('audio', () => {
  expect(whatwgDeepDisallowedSubTagsConfig.tags).toHaveProperty('audio', {
    deepDisallowedSubTags: ['audio', 'video'],
  })
})

test('meter', () => {
  expect(whatwgDeepDisallowedSubTagsConfig.tags).toHaveProperty('meter', {
    deepDisallowedSubTags: ['meter'],
  })
})

test('caption', () => {
  expect(whatwgDeepDisallowedSubTagsConfig.tags).toHaveProperty('caption', {
    deepDisallowedSubTags: ['table'],
  })
})

test('no div', () => {
  expect(whatwgDeepDisallowedSubTagsConfig.tags).not.toHaveProperty('div')
})

import { Config } from '@html-language-features/schema'
import _whatwgConfig from '../generated/whatwg.htmlData.json'

const whatwgConfig = _whatwgConfig as Config

test('meter', () => {
  expect(whatwgConfig.tags).toHaveProperty('meter', {
    categories: [
      'flow content',
      'phrasing content',
      'labelable',
      'palpable content',
    ],
    attributes: {
      value: {},
      min: {},
      max: {},
      low: {},
      high: {},
      optimum: {},
    },
    allowedSubTags: [
      {
        category: 'phrasing content',
      },
    ],
  })
})

test('option', () => {
  expect(whatwgConfig.tags).toHaveProperty('option', {
    categories: [],
    attributes: {
      disabled: {},
      label: {},
      selected: {},
      value: {},
    },
    allowedSubTags: [],
  })
})

test('headings', () => {
  for (let i = 1; i <= 6; i++) {
    expect(whatwgConfig.tags).toHaveProperty(`h${i}`)
  }
  expect(whatwgConfig.tags).not.toHaveProperty('h7')
})

test('dl', () => {
  expect(whatwgConfig.tags).toHaveProperty('dl', {
    categories: ['flow content', 'palpable content'],
    attributes: {},
    allowedSubTags: [
      'dt',
      'dd',
      'div',
      {
        category: 'script-supporting',
      },
    ],
  })
})

test('ruby', () => {
  expect(whatwgConfig.tags).toHaveProperty('ruby', {
    categories: ['flow content', 'phrasing content', 'palpable content'],
    attributes: {},
    allowedSubTags: [
      {
        category: 'phrasing content',
      },
      'rt',
      'rp',
    ],
  })
})

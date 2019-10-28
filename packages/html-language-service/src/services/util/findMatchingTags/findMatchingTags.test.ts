import { findMatchingTags } from './findMatchingTags'

test('can match from opening and closing tag', () => {
  const data = '<a>a</a>'
  const expected = {
    type: 'startAndEndTag',
    tagName: 'a',
    startTagOffset: 0,
    endTagOffset: 4,
  }
  // expect(findMatchingTag(data, 0)).toEqual(expected)
  // expect(findMatchingTag(data, 1)).toEqual(expected)
  // expect(findMatchingTag(data, 2)).toEqual(expected)
  expect(findMatchingTags(data, 3)).toEqual(undefined)
  expect(findMatchingTags(data, 4)).toEqual(expected)
  expect(findMatchingTags(data, 5)).toEqual(expected)
  expect(findMatchingTags(data, 6)).toEqual(expected)
  expect(findMatchingTags(data, 7)).toEqual(expected)
  expect(findMatchingTags(data, 8)).toEqual(undefined)
})

test.skip('can match nested with invalid tags', () => {
  const data = '<a><b></c></b>'
  const expected = {
    opening: { name: 'b', start: 3, end: 6 },
    closing: { name: 'b', start: 10, end: 14 },
  }
  expect(findMatchingTags(data, 0)).toEqual(undefined)
  expect(findMatchingTags(data, 4)).toEqual(expected)
  expect(findMatchingTags(data, 12)).toEqual(expected)
  expect(findMatchingTags(data, 1)).toEqual(undefined)
  expect(findMatchingTags(data, 8)).toEqual(undefined)
})

test('does not match unclosed tags', () => {
  const data = '<a>a'
  expect(findMatchingTags(data, 0)).toEqual(undefined)
  expect(findMatchingTags(data, 1)).toEqual(undefined)
  expect(findMatchingTags(data, 2)).toEqual(undefined)
  expect(findMatchingTags(data, 3)).toEqual(undefined)
  expect(findMatchingTags(data, 4)).toEqual(undefined)
})

test('does not match unfinished opening tags', () => {
  const data = '<a</a>'
  expect(findMatchingTags(data, 0)).toEqual(undefined)
  expect(findMatchingTags(data, 1)).toEqual(undefined)
  expect(findMatchingTags(data, 2)).toEqual(undefined)
  expect(findMatchingTags(data, 3)).toEqual(undefined)
  expect(findMatchingTags(data, 4)).toEqual(undefined)
  expect(findMatchingTags(data, 5)).toEqual(undefined)
  expect(findMatchingTags(data, 6)).toEqual(undefined)
})

test.skip('can match tag from content', () => {
  const data = '<a>a</a>'
  const expected = {
    attributeNestingLevel: 0,
    opening: { name: 'a', start: 0, end: 3 },
    closing: { name: 'a', start: 4, end: 8 },
  }
  expect(findMatchingTags(data, 0)).toEqual(undefined)
  expect(findMatchingTags(data, 1)).toEqual(expected)
  expect(findMatchingTags(data, 2)).toEqual(expected)
  expect(findMatchingTags(data, 3)).toEqual(expected)
  expect(findMatchingTags(data, 4)).toEqual(expected)
  expect(findMatchingTags(data, 5)).toEqual(expected)
  expect(findMatchingTags(data, 6)).toEqual(expected)
  expect(findMatchingTags(data, 7)).toEqual(expected)
  expect(findMatchingTags(data, 8)).toEqual(undefined)
})

test.skip('matches self closing tag when flag is true', () => {
  const data = 'a<a/>a'
  const expected = {
    opening: { name: 'a', start: 1, end: 5 },
    closing: { name: 'a', start: 1, end: 5 },
  }
  expect(findMatchingTags(data, 0)).toEqual(undefined)
  expect(findMatchingTags(data, 1)).toEqual(undefined)
  expect(findMatchingTags(data, 2)).toEqual(expected)
  expect(findMatchingTags(data, 3)).toEqual(expected)
  expect(findMatchingTags(data, 4)).toEqual(expected)
  expect(findMatchingTags(data, 5)).toEqual(undefined)
  expect(findMatchingTags(data, 6)).toEqual(undefined)
})

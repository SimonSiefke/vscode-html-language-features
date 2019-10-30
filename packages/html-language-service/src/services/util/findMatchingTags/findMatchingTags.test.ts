import { findMatchingTags } from './findMatchingTags'

test('can match from opening and closing tag', () => {
  const data = '<a>a</a>\na'
  const expected = {
    type: 'startAndEndTag',
    tagName: 'a',
    startTagOffset: 0,
    endTagOffset: 4,
  }
  expect(findMatchingTags(data, 0)).toEqual(expected)
  expect(findMatchingTags(data, 1)).toEqual(expected)
  expect(findMatchingTags(data, 2)).toEqual(expected)
  expect(findMatchingTags(data, 3)).toEqual(undefined)
  expect(findMatchingTags(data, 4)).toEqual(expected)
  expect(findMatchingTags(data, 5)).toEqual(expected)
  expect(findMatchingTags(data, 6)).toEqual(expected)
  expect(findMatchingTags(data, 7)).toEqual(expected)
  expect(findMatchingTags(data, 8)).toEqual(undefined)
  expect(findMatchingTags(data, 9)).toEqual(undefined)
  expect(findMatchingTags(data, 10)).toEqual(undefined)
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

test('unclosed start tags', () => {
  const data = '<a>a'
  const expected = {
    type: 'onlyStartTag',
    tagName: 'a',
    startTagOffset: 0,
  }
  expect(findMatchingTags(data, 0)).toEqual(expected)
  expect(findMatchingTags(data, 1)).toEqual(expected)
  expect(findMatchingTags(data, 2)).toEqual(expected)
  expect(findMatchingTags(data, 3)).toEqual(undefined)
  expect(findMatchingTags(data, 4)).toEqual(undefined)
})

test('with comments', () => {
  const data = `<div><!-- </div> --></div>`
  const expected = {
    type: 'startAndEndTag',
    tagName: 'div',
    startTagOffset: 0,
    endTagOffset: 20,
  }
  expect(findMatchingTags(data, 0)).toEqual(expected)
  expect(findMatchingTags(data, 10)).toEqual(undefined)
  expect(findMatchingTags(data, 20)).toEqual(expected)
})

test('unfinished opening tags', () => {
  const data = '<a</a>'
  const expected = {
    type: 'onlyStartTag',
    tagName: 'a<',
    startTagOffset: 0,
  }
  expect(findMatchingTags(data, 0)).toEqual(expected)
  expect(findMatchingTags(data, 1)).toEqual(expected)
  expect(findMatchingTags(data, 2)).toEqual(undefined)
  expect(findMatchingTags(data, 3)).toEqual(undefined)
  expect(findMatchingTags(data, 4)).toEqual(undefined)
  expect(findMatchingTags(data, 5)).toEqual(undefined)
  expect(findMatchingTags(data, 6)).toEqual(undefined)
})

test('bug 1', () => {
  // TODO find next closing tag not working correctly
  const data = `<body >
    <div >  </div>
  </body>`
  const expectedBody = {
    type: 'startAndEndTag',
    tagName: 'body',
    startTagOffset: 0,
    endTagOffset: 29,
  }
  const expectedDiv = {
    type: 'startAndEndTag',
    tagName: 'div',
    startTagOffset: 12,
    endTagOffset: 20,
  }
  // expect(findMatchingTags(data, 0)).toEqual(expectedBody) // '<'
  // expect(findMatchingTags(data, 1)).toEqual(expectedBody) // 'b'
  // expect(findMatchingTags(data, 2)).toEqual(expectedBody) // 'o'
  // expect(findMatchingTags(data, 3)).toEqual(expectedBody) // 'd'
  // expect(findMatchingTags(data, 4)).toEqual(expectedBody) // 'y'
  // expect(findMatchingTags(data, 5)).toEqual(expectedBody) // ' '
  // expect(findMatchingTags(data, 6)).toEqual(expectedBody) // '>'
  expect(findMatchingTags(data, 7)).toEqual(undefined) // '\n'
  expect(findMatchingTags(data, 8)).toEqual(undefined) // ' '
  expect(findMatchingTags(data, 9)).toEqual(undefined) // ' '
  expect(findMatchingTags(data, 10)).toEqual(undefined) // ' '
  expect(findMatchingTags(data, 11)).toEqual(undefined) // ' '
  expect(findMatchingTags(data, 12)).toEqual(expectedDiv) // '<'
  expect(findMatchingTags(data, 13)).toEqual(expectedDiv) // 'd'
  expect(findMatchingTags(data, 14)).toEqual(expectedDiv) // 'i'
  expect(findMatchingTags(data, 15)).toEqual(expectedDiv) // 'v'
  expect(findMatchingTags(data, 16)).toEqual(expectedDiv) // ' '
  expect(findMatchingTags(data, 17)).toEqual(expectedDiv) // '>'
  expect(findMatchingTags(data, 18)).toEqual(undefined) // ' '
  expect(findMatchingTags(data, 19)).toEqual(undefined) // ' '
  expect(findMatchingTags(data, 20)).toEqual(expectedDiv) // '<'
  expect(findMatchingTags(data, 21)).toEqual(expectedDiv) // '/'
  expect(findMatchingTags(data, 22)).toEqual(expectedDiv) // 'd'
  expect(findMatchingTags(data, 23)).toEqual(expectedDiv) // 'i'
  expect(findMatchingTags(data, 24)).toEqual(expectedDiv) // 'v'
  expect(findMatchingTags(data, 25)).toEqual(expectedDiv) // '>'
  expect(findMatchingTags(data, 26)).toEqual(undefined) // '\n'
  expect(findMatchingTags(data, 27)).toEqual(undefined) // ' '
  expect(findMatchingTags(data, 28)).toEqual(undefined) // ' '
  expect(findMatchingTags(data, 29)).toEqual(expectedBody) // '<'
  expect(findMatchingTags(data, 30)).toEqual(expectedBody) // '/'
  expect(findMatchingTags(data, 31)).toEqual(expectedBody) // 'b'
  expect(findMatchingTags(data, 32)).toEqual(expectedBody) // 'o'
  expect(findMatchingTags(data, 33)).toEqual(expectedBody) // 'd'
  expect(findMatchingTags(data, 34)).toEqual(expectedBody) // 'y'
  expect(findMatchingTags(data, 35)).toEqual(expectedBody) // '>'
  expect(findMatchingTags(data, 36)).toEqual(undefined) //''
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

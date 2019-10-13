function isAtHTMLTag(input: string) {}

// based on https://github.com/emmetio/extract-abbreviation/blob/master/test/is-html.js

function expectToBeAtHtmlTag(input: string): void {
  expect(isAtHTMLTag(input)).toBe(true)
}

function expectNotToBeAtHTMLTag(input: string): void {
  expect(isAtHTMLTag(input)).toBe(false)
}

test('simple tag', () => {
  expectToBeAtHtmlTag('<div>')
  expectToBeAtHtmlTag('<div/>')
  expectToBeAtHtmlTag('<div />')
  expectToBeAtHtmlTag('</div>')
})

test('tag with attributes', () => {
  expectToBeAtHtmlTag('<div foo="bar">')
  expectToBeAtHtmlTag('<div foo=bar>')
  expectToBeAtHtmlTag('<div foo>')
  expectToBeAtHtmlTag('<div a="b" c=d>')
  expectToBeAtHtmlTag('<div a=b c=d>')
  expectToBeAtHtmlTag('<div a=^b$ c=d>')
  expectToBeAtHtmlTag('<div a=b c=^%d]$>')
  expectToBeAtHtmlTag('<div title=привет>')
  expectToBeAtHtmlTag('<div title=привет123>')
  expectToBeAtHtmlTag('<foo-bar>')
})

test('invalid tags', () => {
  expectNotToBeAtHTMLTag('div>')
  expectNotToBeAtHTMLTag('<div')
  expectNotToBeAtHTMLTag('<div привет>')
  expectNotToBeAtHTMLTag('<div =bar>')
  expectNotToBeAtHTMLTag('<div foo=>')
  expectNotToBeAtHTMLTag('[a=b c=d]>')
  expectNotToBeAtHTMLTag('div[a=b c=d]>')
})

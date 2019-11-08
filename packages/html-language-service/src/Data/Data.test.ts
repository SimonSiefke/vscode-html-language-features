import {
  getDescriptionForAttributeName,
  getDescriptionForAttributeValue,
  getReferenceForAttributeName,
  getReferenceForTag,
  getSuggestedAttributeValues,
  isSelfClosingTag,
  isTagName,
  resetConfigs,
  shouldHaveNewline,
  getSuggestedTags,
  replaceConfigs,
} from './Data'

beforeEach(() => {
  resetConfigs()
})

test('iSelfClosingTag', async () => {
  expect(isSelfClosingTag('input')).toEqual(false)
  await replaceConfigs(
    [
      {
        tags: {
          input: {
            selfClosing: true,
          },
          a: {},
        },
      },
    ],
    'test'
  )
  expect(isSelfClosingTag('input')).toEqual(true)
  expect(isSelfClosingTag('a')).toEqual(false)
  expect(isSelfClosingTag('non-existent tag')).toEqual(false)
})

test('shouldHaveNewline', async () => {
  expect(shouldHaveNewline('div')).toEqual(true)
  expect(shouldHaveNewline('a')).toEqual(true)
  await replaceConfigs(
    [
      {
        tags: {
          div: {
            newline: true,
          },
          a: {
            newline: false,
          },
        },
      },
    ],
    'test'
  )
  expect(shouldHaveNewline('div')).toEqual(true)
  expect(shouldHaveNewline('a')).toEqual(false)
  expect(shouldHaveNewline('non-existing tag')).toEqual(true)
})

test('getReferenceForTag', async () => {
  expect(getReferenceForTag('h1')).toEqual(undefined)
  await replaceConfigs(
    [
      {
        tags: {
          h1: {
            reference: {
              url:
                'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements',
              name: 'MDN Reference',
            },
          },
        },
      },
    ],
    'test'
  )
  expect(getReferenceForTag('h1')).toEqual({
    url:
      'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements',
    name: 'MDN Reference',
  })
})

test('getReferenceForAttributeName', async () => {
  expect(getReferenceForAttributeName('a', 'href')).toEqual(undefined)
  await replaceConfigs(
    [
      {
        tags: {
          a: {
            attributes: {
              href: {
                reference: {
                  url:
                    'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#attr-href',
                  name: 'MDN Reference',
                },
              },
            },
          },
        },
      },
    ],
    'test'
  )
  expect(getReferenceForAttributeName('a', 'href')).toEqual({
    url:
      'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#attr-href',
    name: 'MDN Reference',
  })
})

test('getDescriptionForAttributeName', async () => {
  expect(getDescriptionForAttributeName('a', 'href')).toEqual(undefined)
  expect(getDescriptionForAttributeName('a', 'class')).toEqual(undefined)
  await replaceConfigs(
    [
      {
        globalAttributes: {
          class: {
            description: 'A space-separated list of the classes of the element',
          },
        },
        tags: {
          a: {
            attributes: {
              href: {
                description: 'creates a hyperlink to web pages',
              },
            },
          },
        },
      },
    ],
    'test'
  )
  expect(getDescriptionForAttributeName('a', 'href')).toEqual(
    'creates a hyperlink to web pages'
  )
  expect(getDescriptionForAttributeName('a', 'class')).toEqual(
    'A space-separated list of the classes of the element'
  )
})

test('getDescriptionForAttributeValue', async () => {
  expect(getDescriptionForAttributeValue('a', 'target', '_blank')).toEqual(
    undefined
  )
  expect(getDescriptionForAttributeValue('h1', 'dir', 'ltr')).toEqual(undefined)

  await replaceConfigs(
    [
      {
        globalAttributes: {
          dir: {
            options: {
              ltr: { description: 'left to right' },
              rtl: { description: 'right to left' },
            },
          },
        },
        tags: {
          a: {
            attributes: {
              target: {
                options: {
                  _blank: {
                    description: 'Opens the url in a new tab',
                  },
                },
              },
            },
          },
        },
      },
    ],
    'test'
  )
  expect(getDescriptionForAttributeValue('a', 'target', '_blank')).toEqual(
    'Opens the url in a new tab'
  )
  expect(getDescriptionForAttributeValue('h1', 'dir', 'ltr')).toEqual(
    'left to right'
  )
})

test('isTagName', async () => {
  expect(isTagName('a')).toEqual(false)
  await replaceConfigs(
    [
      {
        tags: {
          a: {},
        },
      },
    ],
    'test'
  )
  expect(isTagName('a')).toEqual(true)
})

test('getSuggestedAttributeValues', async () => {
  expect(getSuggestedAttributeValues('a', 'target')).toEqual(undefined)
  expect(getSuggestedAttributeValues('a', 'dir')).toEqual(undefined)
  await replaceConfigs(
    [
      {
        globalAttributes: {
          dir: {
            options: {
              ltr: { description: 'left to right' },
              rtl: { description: 'right to left' },
            },
          },
        },
        tags: {
          a: {
            attributes: {
              target: {
                options: {
                  _blank: {
                    description: 'Opens the url in a new tab',
                  },
                  _top: {},
                  _self: {},
                  _parent: {},
                },
              },
            },
          },
        },
      },
    ],
    'test'
  )
  expect(getSuggestedAttributeValues('a', 'target')).toEqual([
    '_blank',
    '_top',
    '_self',
    '_parent',
  ])
  expect(getSuggestedAttributeValues('a', 'dir')).toEqual(['ltr', 'rtl'])
})

test('getSuggestedTags `ul`', async () => {
  expect(getSuggestedTags('ul')).toEqual([])
  await replaceConfigs(
    [
      {
        tags: {
          script: {
            categories: ['script-supporting'],
          },
          template: {
            categories: ['script-supporting'],
          },
          ul: {
            allowedSubTags: ['li', { category: 'script-supporting' }],
          },
          li: {},
          div: {
            categories: ['flow content'],
          },
          span: {
            categories: ['phrasing content'],
          },
        },
      },
    ],
    'test'
  )
  expect(getSuggestedTags('ul')).toEqual(['script', 'template', 'li'])
})

test('getSuggestedTags bug #1 (never use the `reverse` method)', async () => {
  await replaceConfigs(
    [
      {
        tags: {
          a: {
            categories: [
              'flow content',
              'phrasing content',
              'palpable content',
            ],
            // allowedParentTags: [
            //   {
            //     category: 'phrasing content',
            //   },
            // ],
            deepDisallowedSubTags: ['a', { category: 'interactive content' }],
          },
        },
      },
    ],
    'test'
  )
  expect(getSuggestedTags('a')).toEqual([])
  expect(getSuggestedTags('a')).toEqual([])
})

test('getSuggestedTags bug #2', async () => {
  await replaceConfigs(
    [
      {
        tags: {
          br: {
            categories: ['flow content', 'phrasing content'],
            allowedSubTags: [],
          },
          body: {
            categories: ['sectioning root content'],
            allowedParentTags: ['html'],
            allowedSubTags: [
              {
                category: 'flow content',
              },
            ],
          },
        },
      },
    ],
    'test'
  )
  expect(getSuggestedTags('body')).toEqual(['br'])
})

test('getSuggestedTags with custom tags #1', async () => {
  await replaceConfigs(
    [
      {
        tags: {
          a: {
            categories: ['phrasing content', 'flow content'],
            deepDisallowedSubTags: ['a', { category: 'interactive content' }],
            allowedSubTags: [
              {
                category: 'phrasing content',
              },
            ],
          },
          span: {
            categories: ['phrasing content'],
          },
          'my-button': {
            categories: [],
          },
        },
      },
    ],
    'test'
  )
  expect(getSuggestedTags('a')).toEqual(['span'])
})

test('getSuggestedTags with custom tags #2', async () => {
  await replaceConfigs(
    [
      {
        tags: {
          a: {
            categories: ['phrasing content'],
            deepDisallowedSubTags: ['a', { category: 'interactive content' }],
            allowedSubTags: [
              {
                category: 'phrasing content',
              },
            ],
          },
          span: {
            categories: ['phrasing content'],
          },
          'my-button': {
            categories: ['phrasing content'],
          },
        },
      },
    ],
    'test'
  )
  expect(getSuggestedTags('a')).toEqual(['span', 'my-button'])
})

test('getSuggestedTags `button` not allowed inside `a`', async () => {
  await replaceConfigs(
    [
      {
        tags: {
          a: {
            categories: ['phrasing content'],
            allowedSubTags: [
              {
                category: 'phrasing content',
              },
            ],
            deepDisallowedSubTags: ['a', { category: 'interactive content' }],
          },
          span: {
            categories: ['phrasing content'],
          },
          div: {
            categories: ['flow content'],
          },
          button: {
            categories: [
              'flow content',
              'phrasing content',
              'interactive content',
            ],
          },
        },
      },
    ],
    'test'
  )
  expect(getSuggestedTags('a')).toEqual(['span'])
})

test('getSuggestedTags `a` allowed inside `button`', async () => {
  await replaceConfigs(
    [
      {
        tags: {
          a: {
            categories: ['phrasing content'],
            allowedSubTags: [
              {
                category: 'phrasing content',
              },
            ],
            deepDisallowedSubTags: ['a', { category: 'interactive content' }],
          },
          span: {
            categories: ['phrasing content'],
          },
          div: {
            categories: ['flow content'],
          },
          button: {
            categories: [
              'flow content',
              'phrasing content',
              'interactive content',
            ],
            deepDisallowedSubTags: [{ category: 'interactive content' }],
            allowedSubTags: [
              {
                category: 'phrasing content',
              },
            ],
          },
        },
      },
    ],
    'test'
  )
  expect(getSuggestedTags('button')).toEqual(['a', 'span'])
})

test('getSuggestedTags `wired-button` not allowed inside `wired-button`', async () => {
  await replaceConfigs(
    [
      {
        tags: {
          'wired-button': {
            categories: [
              'flow content',
              'phrasing content',
              'interactive content',
              'listed content',
              'labelable',
              'submittable content',
              'form-associated content',
              'palpable content',
            ],
            allowedSubTags: [
              {
                category: 'phrasing content',
              },
            ],
            deepDisallowedSubTags: [
              {
                category: 'interactive content',
              },
            ],
          },
        },
      },
    ],
    'test'
  )
  expect(getSuggestedTags('wired-button')).toEqual([])
})

test.skip('adding and removing configs', () => {})

// test('getSuggestedAttributes', () => {})

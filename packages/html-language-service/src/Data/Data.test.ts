import {
  addConfigs,
  getDescriptionForAttributeName,
  getDescriptionForAttributeValue,
  getReferenceForAttributeName,
  getReferenceForTag,
  getSuggestedAttributeValues,
  isSelfClosingTag,
  isTagName,
  resetConfig,
  shouldHaveNewline,
  getSuggestedTags,
} from './Data'

beforeEach(() => {
  resetConfig()
})

test('iSelfClosingTag', () => {
  expect(isSelfClosingTag('input')).toEqual(false)
  addConfigs({
    tags: {
      input: {
        selfClosing: true,
      },
      a: {},
    },
  })
  expect(isSelfClosingTag('input')).toEqual(true)
  expect(isSelfClosingTag('a')).toEqual(false)
  expect(isSelfClosingTag('non-existent tag')).toEqual(false)
})

test('shouldHaveNewline', () => {
  expect(shouldHaveNewline('div')).toEqual(false)
  addConfigs({
    tags: {
      div: {
        newline: true,
      },
      a: {
        newline: false,
      },
    },
  })
  expect(shouldHaveNewline('div')).toEqual(true)
  expect(shouldHaveNewline('a')).toEqual(false)
  expect(shouldHaveNewline('non-existing tag')).toEqual(false)
})

test('getReferenceForTag', () => {
  expect(getReferenceForTag('h1')).toEqual(undefined)
  addConfigs({
    tags: {
      h1: {
        reference: {
          url:
            'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements',
          name: 'MDN Reference',
        },
      },
    },
  })
  expect(getReferenceForTag('h1')).toEqual({
    url:
      'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements',
    name: 'MDN Reference',
  })
})

test('getReferenceForAttributeName', () => {
  expect(getReferenceForAttributeName('a', 'href')).toEqual(undefined)
  addConfigs({
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
  })
  expect(getReferenceForAttributeName('a', 'href')).toEqual({
    url:
      'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#attr-href',
    name: 'MDN Reference',
  })
})

test('getDescriptionForAttributeName', () => {
  expect(getDescriptionForAttributeName('a', 'href')).toEqual(undefined)
  expect(getDescriptionForAttributeName('a', 'class')).toEqual(undefined)
  addConfigs({
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
  })
  expect(getDescriptionForAttributeName('a', 'href')).toEqual(
    'creates a hyperlink to web pages'
  )
  expect(getDescriptionForAttributeName('a', 'class')).toEqual(
    'A space-separated list of the classes of the element'
  )
})

test('getDescriptionForAttributeValue', () => {
  expect(getDescriptionForAttributeValue('a', 'target', '_blank')).toEqual(
    undefined
  )
  expect(getDescriptionForAttributeValue('h1', 'dir', 'ltr')).toEqual(undefined)

  addConfigs({
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
  })
  expect(getDescriptionForAttributeValue('a', 'target', '_blank')).toEqual(
    'Opens the url in a new tab'
  )
  expect(getDescriptionForAttributeValue('h1', 'dir', 'ltr')).toEqual(
    'left to right'
  )
})

test('isTagName', () => {
  expect(isTagName('a')).toEqual(false)
  addConfigs({
    tags: {
      a: {},
    },
  })
  expect(isTagName('a')).toEqual(true)
})

test('getSuggestedAttributeValues', () => {
  expect(getSuggestedAttributeValues('a', 'target')).toEqual(undefined)
  expect(getSuggestedAttributeValues('a', 'dir')).toEqual(undefined)
  addConfigs({
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
  })
  expect(getSuggestedAttributeValues('a', 'target')).toEqual([
    {
      name: '_blank',
      description: 'Opens the url in a new tab',
    },
    {
      name: '_top',
    },
    {
      name: '_self',
    },
    {
      name: '_parent',
    },
  ])
  expect(getSuggestedAttributeValues('a', 'dir')).toEqual([
    { name: 'ltr', description: 'left to right' },
    { name: 'rtl', description: 'right to left' },
  ])
})

test('getSuggestedTags `ul`', () => {
  expect(getSuggestedTags('ul')).toEqual([])
  addConfigs({
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
  })
  expect(getSuggestedTags('ul')).toEqual(['script', 'template', 'li'])
})

test('getSuggestedTags bug #1 (never use the `reverse` method)', () => {
  addConfigs({
    tags: {
      a: {
        categories: ['flow content', 'phrasing content', 'palpable content'],
        // allowedParentTags: [
        //   {
        //     category: 'phrasing content',
        //   },
        // ],
        deepDisallowedSubTags: ['a', { category: 'interactive content' }],
      },
    },
  })
  expect(getSuggestedTags('a')).toEqual([])
  expect(getSuggestedTags('a')).toEqual([])
})

test('getSuggestedTags bug #2', () => {
  addConfigs({
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
  })
  expect(getSuggestedTags('body')).toEqual(['br'])
})

test('getSuggestedTags with custom tags #1', () => {
  addConfigs({
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
  })
  expect(getSuggestedTags('a')).toEqual(['span'])
})

test('getSuggestedTags with custom tags #2', () => {
  addConfigs({
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
  })
  expect(getSuggestedTags('a')).toEqual(['span', 'my-button'])
})

test('getSuggestedTags `button` not allowed inside `a`', () => {
  addConfigs({
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
        categories: ['flow content', 'phrasing content', 'interactive content'],
      },
    },
  })
  expect(getSuggestedTags('a')).toEqual(['span'])
})

test('getSuggestedTags `a` allowed inside `button`', () => {
  addConfigs({
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
        categories: ['flow content', 'phrasing content', 'interactive content'],
        deepDisallowedSubTags: [{ category: 'interactive content' }],
        allowedSubTags: [
          {
            category: 'phrasing content',
          },
        ],
      },
    },
  })
  expect(getSuggestedTags('button')).toEqual(['a', 'span'])
})

test('getSuggestedTags `wired-button` not allowed inside `wired-button`', () => {
  addConfigs({
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
  })
  expect(getSuggestedTags('wired-button')).toEqual([])
})

// test('getSuggestedAttributes', () => {})

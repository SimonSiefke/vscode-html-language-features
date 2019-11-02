import { mergeConfigs } from './mergeConfigs'

test('empty', () => {
  expect(mergeConfigs({}, {})).toEqual({})
})

test('remotes meta', () => {
  expect(mergeConfigs({ __meta__: 'meta info' }, {})).toEqual({})
})

test('merges first into second', () => {
  expect(
    mergeConfigs(
      {
        tags: {
          h1: {
            description: 'top level heading',
          },
        },
      },
      {}
    )
  ).toEqual({
    tags: {
      h1: {
        description: 'top level heading',
      },
    },
  })
})

test('merges second into first', () => {
  expect(
    mergeConfigs(
      {},
      {
        tags: {
          h1: {
            description: 'top level heading',
          },
        },
      }
    )
  ).toEqual({
    tags: {
      h1: {
        description: 'top level heading',
      },
    },
  })
})

test('values are overridden and merged', () => {
  expect(
    mergeConfigs(
      {
        tags: {
          h1: {
            description: 'heading',
            attributes: {
              class: {},
            },
          },
        },
      },
      {
        tags: {
          h1: {
            description: 'top level heading',
          },
        },
      }
    )
  ).toEqual({
    tags: {
      h1: {
        description: 'top level heading',
        attributes: {
          class: {},
        },
      },
    },
  })
})

test('merge different properties without merging probabilities', () => {
  expect(
    mergeConfigs(
      {
        tags: {
          select: {
            attributes: {
              name: {},
            },
          },
        },
      },
      {
        tags: {
          select: {
            allowedSubTags: ['option'],
          },
        },
      }
    )
  ).toEqual({
    tags: {
      select: {
        attributes: {
          name: {},
        },
        allowedSubTags: ['option'],
      },
    },
  })
})

test('merge probabilities 1', () => {
  expect(
    mergeConfigs(
      {
        tags: {
          html: {
            attributes: {
              lang: {
                options: {
                  en: {},
                },
              },
            },
          },
        },
      },
      {
        tags: {
          html: {
            attributes: {
              lang: {
                options: {
                  fr: {},
                },
              },
            },
          },
        },
      }
    )
  ).toEqual({
    tags: {
      html: {
        attributes: {
          lang: {
            options: {
              fr: {},
              en: {},
            },
          },
        },
      },
    },
  })
})

test('merge probabilities with empty object probabilities', () => {
  expect(
    mergeConfigs(
      {
        tags: {
          html: {
            attributes: {
              lang: {
                options: {},
              },
            },
          },
        },
      },
      {
        tags: {
          html: {
            attributes: {
              lang: {
                options: {
                  fr: {},
                },
              },
            },
          },
        },
      }
    )
  ).toEqual({
    tags: {
      html: {
        attributes: {
          lang: {
            options: {
              fr: {},
            },
          },
        },
      },
    },
  })
})

test('merges options', () => {
  expect(
    mergeConfigs(
      {
        tags: {
          a: {
            attributes: {
              rel: {
                options: {
                  alternate: {
                    deprecated: false,
                    experimental: false,
                  },
                  archives: {
                    deprecated: true,
                    experimental: false,
                  },
                },
              },
            },
          },
        },
      },
      {
        tags: {
          a: {
            reference: {
              name: 'MDN Reference',
              url:
                'https://developer.mozilla.org//en-US/docs/Web/HTML/Element/a',
            },
            attributes: {
              rel: {
                description:
                  'The relationship of the linked URL as space-separated link types.',
                reference: {
                  name: 'MDN Reference',
                  url:
                    'https://developer.mozilla.org//en-US/docs/Web/HTML/Element/a#attr-rel',
                },
              },
              href: {
                description:
                  'The URL that the hyperlink points to. Links are not restricted to HTTP-based URLs — they can use any URL scheme supported by browsers:\n\n*   Sections of a page with fragment URLs\n*   Pieces of media files with media fragments\n*   Telephone numbers with tel: URLs\n*   Email addresses with mailto: URLs\n*   While web browsers may not support other URL schemes, web sites can with registerProtocolHandler()',
                reference: {
                  name: 'MDN Reference',
                  url:
                    'https://developer.mozilla.org//en-US/docs/Web/HTML/Element/a#attr-href',
                },
              },
            },
          },
        },
      }
    )
  ).toEqual({
    tags: {
      a: {
        reference: {
          name: 'MDN Reference',
          url: 'https://developer.mozilla.org//en-US/docs/Web/HTML/Element/a',
        },
        attributes: {
          href: {
            description:
              'The URL that the hyperlink points to. Links are not restricted to HTTP-based URLs — they can use any URL scheme supported by browsers:\n\n*   Sections of a page with fragment URLs\n*   Pieces of media files with media fragments\n*   Telephone numbers with tel: URLs\n*   Email addresses with mailto: URLs\n*   While web browsers may not support other URL schemes, web sites can with registerProtocolHandler()',
            reference: {
              name: 'MDN Reference',
              url:
                'https://developer.mozilla.org//en-US/docs/Web/HTML/Element/a#attr-href',
            },
          },
          rel: {
            description:
              'The relationship of the linked URL as space-separated link types.',
            reference: {
              name: 'MDN Reference',
              url:
                'https://developer.mozilla.org//en-US/docs/Web/HTML/Element/a#attr-rel',
            },
            options: {
              alternate: {
                deprecated: false,
                experimental: false,
              },
              archives: {
                deprecated: true,
                experimental: false,
              },
            },
          },
        },
      },
    },
  })
})

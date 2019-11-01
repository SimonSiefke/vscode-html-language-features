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

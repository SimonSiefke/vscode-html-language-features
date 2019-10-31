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
        elements: {
          h1: {
            description: 'top level heading',
          },
        },
      },
      {}
    )
  ).toEqual({
    elements: {
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
        elements: {
          h1: {
            description: 'top level heading',
          },
        },
      }
    )
  ).toEqual({
    elements: {
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
        elements: {
          h1: {
            description: 'heading',
            attributes: {
              class: {
                probability: 0.6,
              },
            },
          },
        },
      },
      {
        elements: {
          h1: {
            description: 'top level heading',
          },
        },
      }
    )
  ).toEqual({
    elements: {
      h1: {
        description: 'top level heading',
        attributes: {
          class: {
            probability: 0.6,
          },
        },
      },
    },
  })
})

test('merge different properties without merging probabilities', () => {
  expect(
    mergeConfigs(
      {
        elements: {
          select: {
            attributes: {
              name: {
                probability: 0.5,
              },
            },
          },
        },
      },
      {
        elements: {
          select: {
            allowedChildren: {
              option: {
                probability: 1,
              },
            },
          },
        },
      }
    )
  ).toEqual({
    elements: {
      select: {
        attributes: {
          name: {
            probability: 0.5,
          },
        },
        allowedChildren: {
          option: {
            probability: 1,
          },
        },
      },
    },
  })
})

test('merge probabilities 1', () => {
  expect(
    mergeConfigs(
      {
        elements: {
          html: {
            attributes: {
              lang: {
                probability: 0.5,
                options: {
                  en: {
                    probability: 1,
                  },
                },
              },
            },
          },
        },
      },
      {
        elements: {
          html: {
            attributes: {
              lang: {
                probability: 1,
                options: {
                  fr: {
                    probability: 1,
                  },
                },
              },
            },
          },
        },
      }
    )
  ).toEqual({
    elements: {
      html: {
        attributes: {
          lang: {
            probability: 0.75,
            options: {
              fr: {
                probability: 0.5,
              },
              en: {
                probability: 0.5,
              },
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
        elements: {
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
        elements: {
          html: {
            attributes: {
              lang: {
                options: {
                  fr: {
                    probability: 1,
                  },
                },
              },
            },
          },
        },
      }
    )
  ).toEqual({
    elements: {
      html: {
        attributes: {
          lang: {
            options: {
              fr: {
                probability: 0.5,
              },
            },
          },
        },
      },
    },
  })
})

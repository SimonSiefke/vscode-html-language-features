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

test('merge different properties', () => {
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

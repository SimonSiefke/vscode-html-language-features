import { validate, ValidationError } from 'jsonschema'
import uniq from 'lodash/uniq'
import { Config } from '../Config'
import * as schema from '../schema/schema.json'

const validateConfig: (
  config: Config
) => { errors: ValidationError[] } = config => {
  const { errors } = validate(config, schema)
  if (errors.length > 0) {
    for (const error of errors) {
      console.error(`invalid schema: ${error.message}`)
    }
    return {
      errors,
    }
  }
  return {
    errors: [],
  }
}

const allKeys: (objects: object[]) => string[] = objects =>
  uniq(objects.flatMap(object => Object.keys(object)))

const mergeProperty: (
  resultObject: object,
  objects: (object | undefined)[],
  key: string
) => object = (resultObject, objects, key) => {
  const isValueArray = objects.find(
    object => object && Array.isArray(object[key])
  )
  const isValueObject = objects.find(
    object => object && typeof object[key] === 'object'
  )
  if (isValueArray) {
    resultObject[key] = uniq(
      objects.filter(Boolean).flatMap(object => (object && object[key]) || [])
    )
  } else if (isValueObject) {
    const nestedKeys = allKeys(
      objects
        .filter(object => object !== undefined)
        .map(object => object![key])
        .filter(nestedObject => nestedObject !== undefined)
    )
    if (key.startsWith('-')) {
      delete resultObject[key.slice(1)]
      resultObject[key] = {}
    } else {
      resultObject[key] = {}
      for (const nestedKey of nestedKeys) {
        const nestedObjects = objects.map(object => {
          if (object === undefined) {
            return undefined
          }
          if (object[key] === undefined) {
            return undefined
          }
          return object[key]
        })

        nestedObjects
        // .filter(nestedObject => nestedObject !== undefined)
        // objects
        // nestedKeys
        // nestedObjects
        resultObject[key] = mergeProperty(
          resultObject[key],
          nestedObjects,
          nestedKey
        )
      }
    }
    objects
  } else {
    // console.log('else')
    resultObject[key] = objects
      .reverse()
      .find(object => object && object[key] !== undefined)![key]
  }
  return resultObject
}

export const mergeConfigs = (
  ...configs: Config[]
): Config | { errors: ValidationError[] } => {
  for (const config of configs) {
    delete config['__meta__']
    const { errors } = validateConfig(config)
    if (errors.length > 0) {
      return {
        errors,
      }
    }
  }

  let resultConfig = {}
  const keys = allKeys(configs)
  for (const key of keys) {
    mergeProperty(resultConfig, configs, key)
  }
  return resultConfig

  // for (const key of topLevelKeys) {
  //   for (const config of configs) {
  //     if (!config[key]) {
  //       continue
  //     }
  //   }
  // }
  // return configs.reduce((total, current) => mergeWith(total, current), {})
  // // for (const config of configs) {
  // finalConfig = mergeWith(finalConfig, config)
  // for (const htmlTag in finalConfig) {
  //   if (htmlTag.startsWith('-')) {
  //     delete finalConfig[htmlTag]
  //     delete finalConfig[htmlTag.slice(1)]
  //   }
  // }
  // }
}

// JSON.stringify(
//   mergeConfigs(
//     {
//       elements: {
//         h1: {
//           description: 'top level',
//         },
//       },
//     },
//     {
//       elements: {
//         h1: {
//           attributes: {
//             class: {},
//           },
//         },
//       },
//     }
//   )
// ) //?

// JSON.stringify(mergeConfigs({}, {})) //?
// JSON.stringify(
//   mergeConfigs(
//     {
//       elements: {
//         h1: {
//           description: 'top level heading',
//         },
//       },
//     },
//     {}
//   )
// ) //?

// JSON.stringify(
//   mergeConfigs(
//     {
//       elements: {
//         select: {
//           attributes: {
//             name: {
//               probability: 0.5,
//             },
//           },
//         },
//       },
//     },
//     {
//       elements: {
//         select: {
//           allowedChildren: {
//             option: {
//               probability: 1,
//             },
//           },
//         },
//       },
//     }
//   )
// ) //?

// JSON.stringify(
//   mergeConfigs(
//     {
//       elements: {
//         select: {
//           attributes: {
//             name: {
//               probability: 0.5,
//             },
//           },
//         },
//       },
//     },
//     {
//       elements: {
//         select: {
//           attributes: {},
//         },
//       },
//     }
//   )
// ) //?

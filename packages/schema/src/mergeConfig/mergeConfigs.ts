import * as schema from '../schema/schema.json'
import { validate, ValidationError } from 'jsonschema'
import merge from 'lodash/merge'
import { Config } from '../Config'

const validateConfig: (
  config: Config
) => { errors: ValidationError[] } = config => {
  const { errors } = validate(config, schema)
  if (errors.length > 0) {
    console.error(`invalid schema: ${errors[0].message}`)
    return {
      errors,
    }
  }
  return {
    errors: [],
  }
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
  return configs.reduce((total, current) => merge(total, current), {})
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

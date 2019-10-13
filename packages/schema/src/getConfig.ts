import { validate } from 'jsonschema'
import * as _ from 'lodash'
import * as schema from './schema/schema.json'
import * as path from 'path'
import * as fs from 'fs'

interface Element {
  description?: string
  markdownDescription?: string
  selfClosing?: boolean
  newline?: boolean
}

interface ConfigWithExtend {
  extends?: string[]
  elements?: {
    [key: string]: Element
  }
}

export type Config = {
  elements: {
    [key: string]: Element
  }
}
const EMPTY_CONFIG: Config = {
  elements: {},
}

export const getConfig = (
  configOrAbsoluteConfigPath: Config | string
): Config => {
  let config = configOrAbsoluteConfigPath
  if (typeof configOrAbsoluteConfigPath === 'string') {
    const configString = fs.readFileSync(configOrAbsoluteConfigPath, 'utf-8')
    const configWithExtend = JSON.parse(configString) as ConfigWithExtend
    config = {
      elements: configWithExtend.elements || {},
    }
    for (const extend of configWithExtend.extends || []) {
      const otherConfig = getConfig(
        path.join(path.dirname(configOrAbsoluteConfigPath), extend)
      )
      config = _.merge(otherConfig, config)
    }
  }
  config = config as Config
  const { errors } = validate(config, schema)
  if (errors.length > 0) {
    console.error(`invalid schema: ${errors[0].message}`)
    return EMPTY_CONFIG
  }
  let htmlTags: { [key: string]: Element } = {}
  if (config.elements) {
    htmlTags = _.mergeWith(htmlTags, config.elements)
    for (const htmlTag in htmlTags) {
      if (htmlTag.startsWith('-')) {
        delete htmlTags[htmlTag]
        delete htmlTags[htmlTag.slice(1)]
      }
    }
  }
  return {
    elements: htmlTags,
  }
}

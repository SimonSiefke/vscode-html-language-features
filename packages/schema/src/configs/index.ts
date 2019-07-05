import { Config } from '../getConfig.js'
import * as _essentialConfig from './generated/essential.htmlData.json'
import * as _baseConfig from './generated/base.htmlData.json'
import * as _recommendedConfig from './generated/recommended.htmlData.json'

export const essentialConfig = _essentialConfig as Config
export const baseConfig = _baseConfig as Config
export const recommendedConfig = _recommendedConfig as Config

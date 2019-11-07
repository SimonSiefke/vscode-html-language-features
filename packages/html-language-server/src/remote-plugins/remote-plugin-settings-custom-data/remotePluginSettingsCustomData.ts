import { RemotePlugin } from '../remotePlugin'
import {
  addConfigs,
  Config,
  replaceConfigs,
} from '@html-language-features/html-language-service'

const updateConfig: (config: Config) => Promise<void> = async config => {
  try {
    replaceConfigs([config], 'config.from.settings')
  } catch (error) {
    console.error('error while updating config')
    console.error(JSON.stringify(error))
    console.error(error.message)
  }
}

export const remotePluginSettingsCustomData: RemotePlugin = async api => {
  // api.connectionProxy
  api.settingsProxy.onDidChangeSettings(async settings => {
    await updateConfig(settings.customData)
  })
  // const initialCustomData = await api.settingsProxy.getSetting('customData')
  // await updateConfig(initialCustomData)
}

import { RemotePlugin } from '../remotePlugin'
import {
  addConfigs,
  removeConfigs,
  Config,
} from '@html-language-features/html-language-service'

let _settingsConfig: Config | undefined

const updateConfig: (config: Config) => Promise<void> = async config => {
  if (_settingsConfig) {
    removeConfigs(_settingsConfig)
  }
  try {
    // TODO workspace folders
    // const config = await connection.workspace.getConfiguration({
    //   scopeUri: '',
    //   section: 'html.customData',
    // })
    await addConfigs(config)
    _settingsConfig = config
  } catch (error) {
    console.error('error while updating config')
    console.error(JSON.stringify(error))
    console.error(error.message)
  }
}

export const remotePluginSettingsCustomData: RemotePlugin = async api => {
  api.settingsProxy.onDidChangeSettings(async settings => {
    await updateConfig(settings.customData)
  })
  // const initialCustomData = await api.settingsProxy.getSetting('customData')
  // await updateConfig(initialCustomData)
}

import { Config } from '@html-language-features/html-language-service'
import { IConnection } from 'vscode-languageserver'

export interface Settings {
  customData: Config
}

type onDidChangeSettingsListener = (settings: Settings) => void

export interface SettingsProxy {
  getSetting: (setting: keyof Settings) => Promise<Settings[typeof setting]>
  onDidChangeSettings: (listener: onDidChangeSettingsListener) => void
}

export const createSettingsProxy: (
  connection: IConnection
) => SettingsProxy = connection => {
  let _settings: Settings = {
    customData: {},
  }
  let _onDidChangeSettingsListeners: onDidChangeSettingsListener[] = []

  connection.onDidChangeConfiguration(({ settings }) => {
    _settings = settings.html as Settings
    for (const listener of _onDidChangeSettingsListeners) {
      listener(settings.html)
    }
  })
  return {
    getSetting: async setting => {
      return _settings[setting]
    },
    onDidChangeSettings: listener => {
      _onDidChangeSettingsListeners.push(listener)
    },
  }
}

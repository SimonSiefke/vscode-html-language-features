import { Config } from '@html-language-features/html-language-service'
import { IConnection } from 'vscode-languageserver'

export interface Settings {
  customData: Config
}

// TODO workspace folders

type onDidChangeSettingsListener = (settings: Settings) => void

/**
 * Wrapper around `connection.onDidChangeConfiguration`
 */
export interface SettingsProxy {
  onDidChangeSettings: (listener: onDidChangeSettingsListener) => void
}

export const createSettingsProxy: (
  connection: IConnection
) => SettingsProxy = connection => {
  let _onDidChangeSettingsListeners: onDidChangeSettingsListener[] = []
  connection.onDidChangeConfiguration(({ settings }) => {
    for (const listener of _onDidChangeSettingsListeners) {
      listener(settings.html)
    }
  })
  return {
    onDidChangeSettings: listener => {
      _onDidChangeSettingsListeners.push(listener)
    },
  }
}

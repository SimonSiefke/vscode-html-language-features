import { ConnectionProxy } from './connectionProxy/connectionProxy'
import { TextDocuments } from 'vscode-languageserver'
import { SettingsProxy } from './settingsProxy/settingsProxy'

export interface RemotePluginApi {
  readonly connectionProxy: ConnectionProxy
  readonly settingsProxy: SettingsProxy
  readonly documents: {
    readonly get: TextDocuments['get']
  }
}

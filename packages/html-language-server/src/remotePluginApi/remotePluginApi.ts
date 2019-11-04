import { ConnectionProxy } from './connectionProxy/connectionProxy'
import { SettingsProxy } from './settingsProxy/settingsProxy'
import { DocumentsProxy } from './documentsProxy/documentsProxy'

export interface RemotePluginApi {
  readonly connectionProxy: ConnectionProxy
  readonly documentsProxy: DocumentsProxy
  readonly settingsProxy: SettingsProxy
}

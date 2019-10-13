import { ConnectionProxy } from '../htmlLanguageServer/connectionProxy'

export interface RemotePluginApi {
  languageServer: {
    onRequest: ConnectionProxy['onRequest']
  }
}

export type RemotePlugin = (api: RemotePluginApi) => void

import { ConnectionProxy } from '../htmlLanguageServer/connectionProxy'
import { TextDocuments } from 'vscode-languageserver'

export interface RemotePluginApi {
  languageServer: {
    onRequest: ConnectionProxy['onRequest']
  }
  documents: {
    get: TextDocuments['get']
  }
}

export type RemotePlugin = (api: RemotePluginApi) => void

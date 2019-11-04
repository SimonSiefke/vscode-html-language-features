import { RemotePlugin } from '../remotePlugin'
import {
  TextDocument,
  DocumentSymbol,
  SymbolKind,
} from 'vscode-languageserver-types'

export const remotePluginSymbol: RemotePlugin = api => {
  api.connectionProxy.onDocumentSymbol(({ textDocument }) => {
    const document = api.documents.get(textDocument.uri) as TextDocument
    const range = {
      start: document.positionAt(0),
      end: document.positionAt(100),
    }
    const symbol: DocumentSymbol = {
      kind: SymbolKind.Field,
      name: 'my symbol',
      range,
      selectionRange: range,
    }
    return [symbol]
  })
}

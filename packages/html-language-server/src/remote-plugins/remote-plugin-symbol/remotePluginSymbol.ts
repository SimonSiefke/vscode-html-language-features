import { RemotePlugin } from '../remotePlugin'
import { DocumentSymbol, SymbolKind } from 'vscode-languageserver'

export const remotePluginSymbol: RemotePlugin = api => {
  api.connectionProxy.onDocumentSymbol(({ textDocument }) => {
    const document = api.documentsProxy.get(textDocument.uri)
    if (!document) {
      return undefined
    }
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

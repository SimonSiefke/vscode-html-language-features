import {
  createConnection,
  IConnection,
  TextDocuments,
  ServerCapabilities,
  TextDocumentSyncKind,
  DocumentSymbol,
  SymbolKind,
  TextDocument,
} from 'vscode-languageserver'
import { createConnectionProxy } from './htmlLanguageServer/connectionProxy'
import { RemotePluginApi } from './plugins/remotePluginApi'
import { remotePluginCompletionElementAutoClose } from './plugins/remote-plugin-completion-element-auto-close/remotePluginCompletionElementAutoClose'
import { remotePluginCompletionElementClose } from './plugins/remote-plugin-completion-element-close/remotePluginCompletionElementClose'
import { remotePluginCompletionElementExpand } from './plugins/remote-plugin-completion-element-expand/remotePluginCompletionElementExpand'
import { addConfig } from '@html-language-features/html-language-service'
import { remotePluginCompletionElementSelfClosing } from './plugins/remote-plugin-completion-element-self-closing/remotePluginCompletionElementSelfClosing'
import { remotePluginCompletionElementAutoRenameTag } from './plugins/remote-plugin-completion-element-auto-rename-tag/remotePluginCompletionElementAutoRenameTag'
import { remotePluginSuggestionElementStartTag } from './plugins/remote-plugin-suggestion-element-start-tag/remotePluginSuggestionElementStartTag'
import { remotePluginSuggestionAttributeKey } from './plugins/remote-plugin-suggestion-attribute-key/remotePluginSuggestionAttributeKey'
import { remotePluginHighlightElementMatchingTag } from './plugins/remote-plugin-highlight-element-matching-tag/remotePluginHighlightElementMatchingTag'
import { remotePluginHoverElement } from './plugins/remote-plugin-hover-element/remotePluginHoverElement'
import { remotePluginSymbol } from './plugins/remote-plugin-symbol/remotePluginSymbol'

const connection: IConnection = createConnection()

console.log = connection.console.log.bind(connection.console)
console.error = connection.console.error.bind(connection.console)

const documents: TextDocuments = new TextDocuments(
  TextDocumentSyncKind.Incremental
)

documents.listen(connection)

connection.onCompletion(event => {
  return new Promise(() => {})
})

connection.onInitialize(() => {
  const capabilities: ServerCapabilities = {
    textDocumentSync: documents.syncKind,
    completionProvider: {
      // resolveProvider: false, // TODO would this be more efficient?
      triggerCharacters: ['<'],
    },
    // hoverProvider: {
    //   workDoneProgress: true,
    // },
    hoverProvider: true, // TODO progress ?
    documentSymbolProvider: true,
    // documentSymbolProvider: {
    //   workDoneProgress: true,
    // },
  }
  return { capabilities }
})

connection.onInitialized(async () => {
  const { essentialConfig } = await import(
    '@html-language-features/schema/dist/configs'
  )
  addConfig(essentialConfig)
  const connectionProxy = createConnectionProxy(connection)
  const api: RemotePluginApi = {
    languageServer: connectionProxy,
    documents,
  }
  remotePluginCompletionElementAutoClose(api)
  remotePluginCompletionElementClose(api)
  remotePluginCompletionElementExpand(api)
  remotePluginCompletionElementSelfClosing(api)
  remotePluginCompletionElementAutoRenameTag(api)

  remotePluginHighlightElementMatchingTag(api)

  remotePluginHoverElement(api)

  remotePluginSuggestionElementStartTag(api)
  remotePluginSuggestionAttributeKey(api)

  remotePluginSymbol(api)
})

connection.listen()

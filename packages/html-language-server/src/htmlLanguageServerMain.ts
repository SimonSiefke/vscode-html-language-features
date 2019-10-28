import {
  createConnection,
  IConnection,
  TextDocuments,
  ServerCapabilities,
  TextDocumentSyncKind,
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
import { remotePluginSuggestAttributeKey } from './plugins/remote-plugin-suggestion-attribute-key/remotePluginSuggestionAttributeKey'
import { remotePluginHighlightElementMatchingTag } from './plugins/remote-plugin-highlight-element-matching-tag/remotePluginHighlightElementMatchingTag'

// Create a connection for the server
const connection: IConnection = createConnection()

console.log = connection.console.log.bind(connection.console)
console.error = connection.console.error.bind(connection.console)

// Create a text document manager.
const documents: TextDocuments = new TextDocuments(
  TextDocumentSyncKind.Incremental
)
// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection)

// After the server has started the client sends an initialize request. The server receives
// in the passed params the rootPath of the workspace plus the client capabilities
connection.onInitialize(() => {
  const capabilities: ServerCapabilities = {
    textDocumentSync: documents.syncKind,
    completionProvider: {
      // resolveProvider: false,
      triggerCharacters: ['<'],
    },
    // hoverProvider: true,
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

  remotePluginSuggestionElementStartTag(api)
  remotePluginSuggestAttributeKey(api)

  remotePluginHighlightElementMatchingTag(api)
})

// connectionProxy.onCompletion(({ textDocument, position }) => {
//   const document = documents.get(textDocument.uri) as TextDocument
//   const regions = parseRegions(document.getText())
//   const offset = document.offsetAt(position)
//   if (regions.find(region => region.start <= offset && offset <= region.end)) {
//     return undefined
//   }
//   // return doComplete(document, position)
// })

// connectionProxy.onRequest(
//   new RequestType<
//     TextDocumentPositionParams,
//     { startOffset: number; endOffset: number; word: string },
//     any,
//     any
//   >('html/auto-rename-tag'),
//   async ({ textDocument, position }) => {
//     const document = documents.get(textDocument.uri) as TextDocument
//     const text = document.getText()
//     const offset = document.offsetAt(position)
//     return doAutoRenameTagCompletion(text, offset)
//   }
// )

// Listen on the connection
connection.listen()

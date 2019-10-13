import {
  createConnection,
  IConnection,
  TextDocuments,
  ServerCapabilities,
  TextDocumentSyncKind,
  TextDocumentPositionParams,
  RequestType,
  Range,
  Position,
  TextDocument,
} from 'vscode-languageserver'
import { createConnectionProxy } from './htmlLanguageServer/connectionProxy'
import { parseRegions } from 'html-parser'
import {
  addSchema,
  doAutoRenameTagCompletion,
  doCompletionElementAutoClose,
} from 'html-language-service'
import {
  doComplete,
  doEndTagCloseCompletion,
  doSelfClosingTagCloseCompletion,
} from 'html-language-service'
import { doEmmetTagCompletion } from 'html-language-service'
import * as path from 'path'
import { pluginCompletionElementAutoClose } from './plugins/remotePluginCompletionElementExpand'

// Create a connection for the server
const connection: IConnection = createConnection()

console.log = connection.console.log.bind(connection.console)
console.error = connection.console.error.bind(connection.console)

// Create a text document manager.
const documents: TextDocuments = new TextDocuments(
  TextDocumentSyncKind.Incremental
)
setInterval(() => {
  console.log(documents.all().length)
}, 200)
// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection)

// After the server has started the client sends an initialize request. The server receives
// in the passed params the rootPath of the workspace plus the client capabilities
connection.onInitialize(() => {
  const capabilities: ServerCapabilities = {
    textDocumentSync: documents.syncKind,
    // completionProvider: {
    //   resolveProvider: false,
    //   triggerCharacters: [],
    // },
    // hoverProvider: true,
  }
  return { capabilities }
})

connection.onInitialized(async () => {
  const { essentialConfig } = await import('schema/dist/configs')
  addSchema(essentialConfig)
})

connection.window

const connectionProxy = createConnectionProxy(connection)

// const api = {
//   onRequest: connectionProxy.onRequest.bind(connectionProxy),
// }

// pluginCompletionElementAutoClose(api)

connectionProxy.onCompletion(({ textDocument, position }) => {
  const document = documents.get(textDocument.uri) as TextDocument
  const regions = parseRegions(document.getText())
  const offset = document.offsetAt(position)
  if (regions.find(region => region.start <= offset && offset <= region.end)) {
    return undefined
  }
  return doComplete(document, position)
})

connectionProxy.onRequest(
  new RequestType<TextDocumentPositionParams, string | undefined, any, any>(
    'html/end-tag-close'
  ),
  async ({ textDocument, position }) => {
    const document = documents.get(textDocument.uri) as TextDocument
    const text = document.getText()
    const offset = document.offsetAt(position)
    return doEndTagCloseCompletion(text, offset)
  }
)

connectionProxy.onRequest(
  new RequestType<TextDocumentPositionParams, string | undefined, any, any>(
    'html/end-tag-auto-close'
  ),
  async ({ textDocument, position }) => {
    console.log('auto close')
    const document = documents.get(textDocument.uri) as TextDocument
    const text = document.getText(Range.create(Position.create(0, 0), position))
    const offset = document.offsetAt(position)
    return doCompletionElementAutoClose(text, offset)
  }
)

connectionProxy.onRequest(
  new RequestType<TextDocumentPositionParams, string | undefined, any, any>(
    'html/self-closing-tag-close-completion'
  ),
  async ({ textDocument, position }) => {
    const document = documents.get(textDocument.uri) as TextDocument
    const text = document.getText(Range.create(Position.create(0, 0), position))
    const offset = document.offsetAt(position)
    return doSelfClosingTagCloseCompletion(text, offset)
  }
)

connectionProxy.onRequest(
  new RequestType<
    TextDocumentPositionParams,
    { completionString: string; completionOffset: number },
    any,
    any
  >('html/emmet-tag-completion'),
  async ({ textDocument, position }) => {
    const document = documents.get(textDocument.uri) as TextDocument
    const text = document.getText(Range.create(Position.create(0, 0), position))
    const offset = document.offsetAt(position)
    return doEmmetTagCompletion(text, offset)
  }
)

connectionProxy.onRequest(
  new RequestType<
    TextDocumentPositionParams,
    { startOffset: number; endOffset: number; word: string },
    any,
    any
  >('html/auto-rename-tag'),
  async ({ textDocument, position }) => {
    const document = documents.get(textDocument.uri) as TextDocument
    const text = document.getText()
    const offset = document.offsetAt(position)
    return doAutoRenameTagCompletion(text, offset)
  }
)

// Listen on the connection
connection.listen()

import {
  addConfigs,
  Config,
} from '@html-language-features/html-language-service'
import {
  createConnection,
  IConnection,
  ServerCapabilities,
  TextDocuments,
  CompletionRequest,
  HoverRequest,
  DocumentSymbolRequest,
  DocumentSymbolOptions,
  CompletionOptions,
  HoverOptions,
  DidChangeConfigurationNotification,
  DidChangeConfigurationRegistrationOptions,
} from 'vscode-languageserver'
import { createConnectionProxy } from './remotePluginApi/connectionProxy/connectionProxy'
import { remotePluginSymbol } from './plugins/remote-plugin-symbol/remotePluginSymbol'
import { createSettingsProxy } from './remotePluginApi/settingsProxy/settingsProxy'
import { RemotePluginApi } from './remotePluginApi/remotePluginApi'
import { remotePluginSettingsCustomData } from './plugins/remote-plugin-settings-custom-data/remotePluginSettingsCustomData'
import { remotePluginAutoCompletionElementAutoClose } from './plugins/remote-plugin-auto-completion-element-auto-close/remotePluginAutoCompletionElementAutoClose'
import { remotePluginAutoCompletionElementSelfClosing } from './plugins/remote-plugin-auto-completion-element-self-closing/remotePluginAutoCompletionElementSelfClosing'
import { remotePluginHoverElement } from './plugins/remote-plugin-hover-element/remotePluginHoverElement'
import { remotePluginCompletionAttributeName } from './plugins/remote-plugin-completion-attribute-name/remotePluginCompletionAttributeName'
import { remotePluginCompletionElementStartTag } from './plugins/remote-plugin-completion-element-start-tag/remotePluginCompletionElementStartTag'
import { remotePluginHighlightElementMatchingTag } from './plugins/remote-plugin-highlight-element-matching-tag/remotePluginHighlightElementMatchingTag'

const connection: IConnection = createConnection()

console.log = connection.console.log.bind(connection.console)
console.error = connection.console.error.bind(connection.console)

process.on('uncaughtException', error => {
  console.error(
    'An uncaught exception occurred. Please open an issue on Github (https://github.com/SimonSiefke/vscode-html-language-features)'
  )
  console.error(error.stack)
})

process.on('unhandledRejection', error => {
  console.error(
    'An unhandled rejection occurred. Please open an issue on Github (https://github.com/SimonSiefke/vscode-html-language-features)'
  )
  console.error((error as Error).stack)
})

const documents: TextDocuments = new TextDocuments()

documents.listen(connection)

connection.onInitialize(() => {
  const capabilities: ServerCapabilities = {
    textDocumentSync: documents.syncKind,
  }
  return { capabilities }
})

connection.onInitialized(async () => {
  const mdnConfig: Config = await import(
    '@html-language-features/facts-generator/generated/mdn.htmlData.json'
  )
  const mdnGlobalAttributeConfig: Config = await import(
    '@html-language-features/facts-generator/generated/mdnGlobalAttributes.htmlData.json'
  )
  const mdnLinkTypeConfig: Config = await import(
    '@html-language-features/facts-generator/generated/mdnLinkTypes.htmlData.json'
  )
  const whatwgConfig: Config = (await import(
    '@html-language-features/facts-generator/generated/whatwg.htmlData.json'
  )) as Config
  const curatedFactsConfig: Config = await import(
    '@html-language-features/curated-facts/generated/curated.htmlData.json'
  )

  try {
    await addConfigs(
      mdnConfig,
      mdnGlobalAttributeConfig,
      mdnLinkTypeConfig,
      whatwgConfig,
      curatedFactsConfig
    )
  } catch (error) {
    console.error('an error occurred')
    console.error(error)
  }
  // TODO errors send to client and client shows helpful error message

  const api: RemotePluginApi = {
    connectionProxy: createConnectionProxy(connection),
    settingsProxy: createSettingsProxy(connection),
    documents,
  }

  remotePluginAutoCompletionElementAutoClose(api)
  remotePluginAutoCompletionElementSelfClosing(api)

  remotePluginHighlightElementMatchingTag(api)

  const hoverOptions: HoverOptions = {}
  connection.client.register(HoverRequest.type, hoverOptions)
  remotePluginHoverElement(api)

  const didChangeConfigurationOptions: DidChangeConfigurationRegistrationOptions = {
    section: 'html',
  }
  connection.client.register(
    DidChangeConfigurationNotification.type,
    didChangeConfigurationOptions
  )
  remotePluginSettingsCustomData(api)

  const completionOptions: CompletionOptions = {
    resolveProvider: true,
    triggerCharacters: ['<'],
  }
  connection.client.register(CompletionRequest.type, completionOptions)
  // remotePluginSuggestionElementExpand(api) // TODO
  remotePluginCompletionAttributeName(api)
  remotePluginCompletionElementStartTag(api)
  remotePluginCompletionAttributeName(api)

  const symbolOptions: DocumentSymbolOptions = {}
  connection.client.register(DocumentSymbolRequest.type, symbolOptions)
  remotePluginSymbol(api)
})

connection.listen()

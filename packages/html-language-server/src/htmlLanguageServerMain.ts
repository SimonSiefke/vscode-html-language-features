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
  TextDocumentSyncKind,
} from 'vscode-languageserver'

import { remotePluginCompletionElementExpand } from './remote-plugins/remote-plugin-completion-element-expand/remotePluginCompletionElementExpand'
import { RemotePluginApi } from './remote-plugin-api/remotePluginApi'
import { createConnectionProxy } from './remote-plugin-api/connectionProxy/connectionProxy'
import { createSettingsProxy } from './remote-plugin-api/settingsProxy/settingsProxy'
import { createDocumentsProxy } from './remote-plugin-api/documentsProxy/documentsProxy'
import { remotePluginAutoCompletionElementAutoClose } from './remote-plugins/remote-plugin-auto-completion-element-auto-close/remotePluginAutoCompletionElementAutoClose'
import { remotePluginAutoCompletionElementSelfClosing } from './remote-plugins/remote-plugin-auto-completion-element-self-closing/remotePluginAutoCompletionElementSelfClosing'
import { remotePluginHighlightElementMatchingTag } from './remote-plugins/remote-plugin-highlight-element-matching-tag/remotePluginHighlightElementMatchingTag'
import { remotePluginHoverElement } from './remote-plugins/remote-plugin-hover-element/remotePluginHoverElement'
import { remotePluginSettingsCustomData } from './remote-plugins/remote-plugin-settings-custom-data/remotePluginSettingsCustomData'
import { remotePluginCompletionElementStartTag } from './remote-plugins/remote-plugin-completion-element-start-tag/remotePluginCompletionElementStartTag'
import { remotePluginCompletionAttributeName } from './remote-plugins/remote-plugin-completion-attribute-name/remotePluginCompletionAttributeName'
import { remotePluginSymbol } from './remote-plugins/remote-plugin-symbol/remotePluginSymbol'
import { remotePluginCompletionAttributeValue } from './remote-plugins/remote-plugin-completion-attribute-value/remotePluginCompletionAttributeValue'
import { remotePluginCompletionEntity } from './remote-plugins/remote-plugin-completion-entity/remotePluginCompletionEntity'
import { remotePluginCompletionElementSimpleDocument } from './remote-plugins/remote-plugin-completion-element-simple-document/remotePluginCompletionElementSimpleDocument'
import { TextDocument } from 'vscode-languageserver-textdocument'
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

const documents = new TextDocuments(TextDocument)

documents.listen(connection)

connection.onInitialize(() => {
  const capabilities: ServerCapabilities = {
    textDocumentSync: TextDocumentSyncKind.Incremental,
  }
  return { capabilities }
})

connection.onInitialized(async () => {
  const mdnConfig: Config = (await import(
    '@html-language-features/facts-generator/generated/mdn.htmlData.json'
  )) as Config
  const mdnGlobalAttributeConfig: Config = await import(
    '@html-language-features/facts-generator/generated/mdnGlobalAttributes.htmlData.json'
  )
  const mdnLinkTypeConfig: Config = await import(
    '@html-language-features/facts-generator/generated/mdnLinkTypes.htmlData.json'
  )
  const whatwgConfig: Config = (await import(
    '@html-language-features/facts-generator/generated/whatwg.htmlData.json'
  )) as Config

  const whatwgConfigDeepDisallowedSubTags: Config = (await import(
    '@html-language-features/facts-generator/generated/whatwgDeepDisallowedSubTags.htmlData.json'
  )) as Config

  const generalFactsConfig: Config = await import(
    '@html-language-features/curated-facts/generated/general-facts/curated.htmlData.json'
  )

  try {
    await addConfigs(
      mdnConfig,
      mdnGlobalAttributeConfig,
      mdnLinkTypeConfig,
      whatwgConfig,
      whatwgConfigDeepDisallowedSubTags,
      generalFactsConfig
    )
  } catch (error) {
    console.error('an error occurred')
    console.error(error)
  }
  // TODO errors send to client and client shows helpful error message

  const api: RemotePluginApi = {
    connectionProxy: createConnectionProxy(connection),
    settingsProxy: createSettingsProxy(connection),
    documentsProxy: createDocumentsProxy(documents),
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
    triggerCharacters: ['<', '&', '!'],
  }
  connection.client.register(CompletionRequest.type, completionOptions)
  // remotePluginSuggestionElementExpand(api) // TODO
  remotePluginCompletionEntity(api)

  remotePluginCompletionElementSimpleDocument(api)
  remotePluginCompletionElementExpand(api)
  remotePluginCompletionElementStartTag(api)
  remotePluginCompletionAttributeName(api)
  remotePluginCompletionAttributeValue(api)

  const symbolOptions: DocumentSymbolOptions = {}
  connection.client.register(DocumentSymbolRequest.type, symbolOptions)
  remotePluginSymbol(api)
})

connection.listen()

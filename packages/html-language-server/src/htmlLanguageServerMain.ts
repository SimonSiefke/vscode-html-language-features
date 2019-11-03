import {
  addConfigs,
  Config,
} from '@html-language-features/html-language-service'
import {
  createConnection,
  IConnection,
  ServerCapabilities,
  TextDocuments,
} from 'vscode-languageserver'
import { createConnectionProxy } from './htmlLanguageServer/connectionProxy'
import { remotePluginCompletionElementAutoClose } from './plugins/remote-plugin-completion-element-auto-close/remotePluginCompletionElementAutoClose'
import { remotePluginCompletionElementAutoRenameTag } from './plugins/remote-plugin-completion-element-auto-rename-tag/remotePluginCompletionElementAutoRenameTag'
import { remotePluginCompletionElementClose } from './plugins/remote-plugin-completion-element-close/remotePluginCompletionElementClose'
import { remotePluginCompletionElementSelfClosing } from './plugins/remote-plugin-completion-element-self-closing/remotePluginCompletionElementSelfClosing'
import { remotePluginHighlightElementMatchingTag } from './plugins/remote-plugin-highlight-element-matching-tag/remotePluginHighlightElementMatchingTag'
import { remotePluginHoverElement } from './plugins/remote-plugin-hover-element/remotePluginHoverElement'
import { remotePluginSuggestionAttributeValue } from './plugins/remote-plugin-suggest-attribute-value/remotePluginSuggestAttributeValue'
import { remotePluginSuggestionAttributeName } from './plugins/remote-plugin-suggestion-attribute-name/remotePluginSuggestionAttributeName'
// import { remotePluginSuggestionElementExpand } from './plugins/remote-plugin-suggestion-element-expand/remotePluginSuggestionElementExpand'
import { remotePluginSuggestionElementStartTag } from './plugins/remote-plugin-suggestion-element-start-tag/remotePluginSuggestionElementStartTag'
import { remotePluginSymbol } from './plugins/remote-plugin-symbol/remotePluginSymbol'
import { RemotePluginApi } from './plugins/remotePluginApi'

const connection: IConnection = createConnection()

console.log = connection.console.log.bind(connection.console)
console.error = connection.console.error.bind(connection.console)

process.on('uncaughtException', error =>
  console.error(JSON.stringify(error.message))
)
process.on('unhandledRejection', error => console.error(JSON.stringify(error)))

const documents: TextDocuments = new TextDocuments()

documents.listen(connection)

connection.onInitialize(() => {
  const capabilities: ServerCapabilities = {
    textDocumentSync: documents.syncKind,
    completionProvider: {
      resolveProvider: true,
      triggerCharacters: ['<'],
    },
    hoverProvider: true,
    documentSymbolProvider: true, // TODO progress for this
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
  // TODO send to client and client shows error message
  const connectionProxy = createConnectionProxy(connection)
  const api: RemotePluginApi = {
    languageServer: connectionProxy,
    documents,
  }
  remotePluginCompletionElementAutoClose(api)
  remotePluginCompletionElementClose(api)
  remotePluginCompletionElementSelfClosing(api)
  remotePluginCompletionElementAutoRenameTag(api)

  remotePluginHighlightElementMatchingTag(api)

  remotePluginHoverElement(api)

  // remotePluginSuggestionElementExpand(api)
  remotePluginSuggestionElementStartTag(api)
  remotePluginSuggestionAttributeName(api)
  remotePluginSuggestionAttributeValue(api)

  remotePluginSymbol(api)

  connection.onDidChangeConfiguration(event => {
    event.settings
  })
  try {
    // TODO workspace folders
    // const config = await connection.workspace.getConfiguration({
    //   scopeUri: '',
    //   section: 'html.customData',
    // })
    const config: Config = await connection.workspace.getConfiguration(
      'html.customData'
    )
    await addConfigs(config)
  } catch (error) {
    console.error(JSON.stringify(error))
    console.error(error.message)
  }
})

connection.listen()

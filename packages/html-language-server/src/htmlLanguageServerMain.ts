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
  // const w3schoolsConfig: Config = await import(
  //   '@html-language-features/facts-generator/generated/w3schools.htmlData.json'
  // )
  const whatwgConfig: Config = (await import(
    '@html-language-features/facts-generator/generated/whatwg.htmlData.json'
  )) as Config
  // const attributeStatisticsConfig: Config = await import(
  //   '@html-language-features/statistics-generator/dist/generated/attributes.htmlData.json'
  // )
  // const tagStatisticsConfig: Config = await import(
  //   '@html-language-features/statistics-generator/dist/generated/tags.htmlData.json'
  // )
  const curatedFactsConfig: Config = await import(
    '@html-language-features/curated-facts/generated/curated.htmlData.json'
  )

  // const curatedWiredElementsConfig: Config = await import(
  //   '@html-language-features/curated-facts/generated/wired-elements/curated.htmlData.json'
  // )
  // const mdnFlowContentConfig: Config = await import(
  //   '@html-language-features/facts-generator/generated/mdnFlowContent.htmlData.json'
  // )
  // const mdnPhrasingContentConfig: Config = await import(
  //   '@html-language-features/facts-generator/generated/mdnPhrasingContent.htmlData.json'
  // )
  // const mdnPermittedContentConfig: Config = await import(
  //   '@html-language-features/facts-generator/generated/mdnPermittedContent.htmlData.json'
  // )
  // const githubStatisticsConfig = await import(
  //   '@html-language-features/github-scraper/generated/generated.htmlData.json'
  // )
  // const snippetsConfig = await import(
  //   '@html-language-features/snippets/src/snippets.htmlData.json'
  // )
  const { errors } = addConfigs(
    mdnConfig,
    // curatedWiredElementsConfig,
    mdnGlobalAttributeConfig,
    mdnLinkTypeConfig,
    whatwgConfig,
    curatedFactsConfig
  )
  // snippetsConfig
  // w3schoolsConfig,
  // githubStatisticsConfig
  // tagStatisticsConfig,
  // attributeStatisticsConfig
  if (errors.length > 0) {
    console.error('an error occurred')
    // TODO send to client and client shows error message
  }
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

  try {
    const config = await connection.workspace.getConfiguration(
      'html.customData'
    )
    addConfigs(config)
  } catch (error) {
    console.error(error)
  }
})

connection.listen()

import * as vscode from 'vscode'
import * as htmlLanguageConfigurationService from './services/LanguageConfiguration/htmlLanguageConfigurationService'
import { createLanguageClient } from './services/LanguageClient'
import { localPluginCompletionElementExpand } from './plugins/local-plugin-completion-element-expand/localPluginCompletionElementExpand'
import { localPluginCompletionElementAutoClose } from './plugins/local-plugin-completion-element-auto-close/localPluginCompletionElementAutoClose'
import { localPluginCompletionElementClose } from './plugins/local-plugin-completion-element-close/localPluginCompletionElementClose'

export async function activate(context: vscode.ExtensionContext) {
  htmlLanguageConfigurationService.activate(context)

  const languageClient = await createLanguageClient(context)
  languageClient.registerLocalPlugin(localPluginCompletionElementExpand)
  languageClient.registerLocalPlugin(localPluginCompletionElementAutoClose)
  languageClient.registerLocalPlugin(localPluginCompletionElementClose)
}

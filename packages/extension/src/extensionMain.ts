import * as vscode from 'vscode'
import * as htmlLanguageConfigurationService from './services/LanguageConfiguration/htmlLanguageConfigurationService'
import { createLanguageClient } from './services/LanguageClient'
import { localPluginCompletionElementExpand } from './plugins/local-plugin-completion-element-expand/localPluginCompletionElementExpand'
import { localPluginCompletionElementAutoClose } from './plugins/local-plugin-completion-element-auto-close/localPluginCompletionElementAutoClose'
import { localPluginCompletionElementClose } from './plugins/local-plugin-completion-element-close/localPluginCompletionElementClose'
import { localPluginCompletionElementSelfClosing } from './plugins/local-plugin-completion-element-self-closing/localPluginCompletionElementSelfClosing'
import { localPluginCompletionElementAutoRenameTag } from './plugins/local-plugin-completion-element-auto-rename-tag/localPluginCompletionElementAutoRenameTag'

export const activate: (
  context: vscode.ExtensionContext
) => Promise<void> = async context => {
  htmlLanguageConfigurationService.activate(context)
  const languageClient = await createLanguageClient(context)
  languageClient.registerLocalPlugin(localPluginCompletionElementExpand)
  languageClient.registerLocalPlugin(localPluginCompletionElementAutoClose)
  languageClient.registerLocalPlugin(localPluginCompletionElementClose)
  languageClient.registerLocalPlugin(localPluginCompletionElementSelfClosing)
  languageClient.registerLocalPlugin(localPluginCompletionElementAutoRenameTag)
}

import * as vscode from 'vscode'
import { createLanguageClient } from './LanguageClient/LanguageClient'
import { localPluginCompletionElementExpand } from './plugins/local-plugin-completion-element-expand/localPluginCompletionElementExpand'
import { localPluginCompletionElementAutoClose } from './plugins/local-plugin-completion-element-auto-close/localPluginCompletionElementAutoClose'
import { localPluginCompletionElementClose } from './plugins/local-plugin-completion-element-close/localPluginCompletionElementClose'
import { localPluginCompletionElementSelfClosing } from './plugins/local-plugin-completion-element-self-closing/localPluginCompletionElementSelfClosing'
import { localPluginCompletionElementAutoRenameTag } from './plugins/local-plugin-completion-element-auto-rename-tag/localPluginCompletionElementAutoRenameTag'
import { localPluginHighlightElementMatchingTag } from './plugins/local-plugin-highlight-element-matching-tag/localPluginHighlightElementMatchingTag'

export const activate: (
  context: vscode.ExtensionContext
) => Promise<void> = async context => {
  import('./LanguageConfiguration/htmlLanguageConfigurationFromVscode')
  const languageClient = await createLanguageClient(context)
  // languageClient.registerLocalPlugin(localPluginCompletionElementExpand)
  languageClient.registerLocalPlugin(localPluginCompletionElementAutoClose)
  languageClient.registerLocalPlugin(localPluginCompletionElementClose)
  languageClient.registerLocalPlugin(localPluginCompletionElementSelfClosing)
  languageClient.registerLocalPlugin(localPluginCompletionElementAutoRenameTag)
  languageClient.registerLocalPlugin(localPluginHighlightElementMatchingTag)
}

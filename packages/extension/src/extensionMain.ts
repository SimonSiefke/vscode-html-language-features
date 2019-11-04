import * as vscode from 'vscode'
import { createLanguageClientProxy } from './local-plugin-api/languageClientProxy/languageClientProxy'
import { LocalPluginApi } from './local-plugin-api/localPluginApi'
import { createVscodeProxy } from './local-plugin-api/vscodeProxy/vscodeProxy'
import { localPluginAutoCompletionElementAutoClose } from './plugins/local-plugin-auto-completion-element-auto-close/localPluginAutoCompletionElementAutoClose'
import { localPluginAutoCompletionElementClose } from './plugins/local-plugin-auto-completion-element-close/localPluginAutoCompletionElementClose'
import { localPluginAutoCompletionElementRenameTag } from './plugins/local-plugin-auto-completion-element-rename-tag/localPluginAutoCompletionElementRenameTag'
import { localPluginAutoCompletionElementSelfClosing } from './plugins/local-plugin-auto-completion-element-self-closing/localPluginAutoCompletionElementSelfClosing'
import { localPluginHighlightElementMatchingTag } from './plugins/local-plugin-highlight-element-matching-tag/localPluginHighlightElementMatchingTag'
import { localPluginLanguageConfiguration } from './plugins/local-plugin-language-configuration/localPluginLanguageConfiguration'

export const activate: (
  context: vscode.ExtensionContext
) => Promise<void> = async context => {
  const api: LocalPluginApi = {
    languageClientProxy: await createLanguageClientProxy(context),
    vscodeProxy: createVscodeProxy(context),
  }
  localPluginLanguageConfiguration(api)

  localPluginAutoCompletionElementAutoClose(api)
  localPluginAutoCompletionElementClose(api)
  localPluginAutoCompletionElementRenameTag(api)
  localPluginAutoCompletionElementSelfClosing(api)

  localPluginHighlightElementMatchingTag(api)
}

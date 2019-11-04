import * as vscode from 'vscode'
import { localPluginCompletionElementAutoClose } from './plugins/local-plugin-completion-element-auto-close/localPluginCompletionElementAutoClose'
import { localPluginCompletionElementClose } from './plugins/local-plugin-completion-element-close/localPluginCompletionElementClose'
import { localPluginCompletionElementSelfClosing } from './plugins/local-plugin-completion-element-self-closing/localPluginCompletionElementSelfClosing'
import { localPluginCompletionElementAutoRenameTag } from './plugins/local-plugin-completion-element-auto-rename-tag/localPluginCompletionElementAutoRenameTag'
import { localPluginHighlightElementMatchingTag } from './plugins/local-plugin-highlight-element-matching-tag/localPluginHighlightElementMatchingTag'
import { createLanguageClientProxy } from './local-plugin-api/languageClientProxy/languageClientProxy'
import { LocalPluginApi } from './local-plugin-api/localPluginApi'
import { createVscodeProxy } from './local-plugin-api/vscodeProxy/vscodeProxy'
import { localPluginLanguageConfiguration } from './plugins/local-plugin-language-configuration/localPluginLanguageConfiguration'

export const activate: (
  context: vscode.ExtensionContext
) => Promise<void> = async context => {
  const api: LocalPluginApi = {
    languageClientProxy: await createLanguageClientProxy(context),
    vscodeProxy: createVscodeProxy(context),
  }
  localPluginLanguageConfiguration(api)

  localPluginCompletionElementAutoClose(api)
  localPluginCompletionElementClose(api)
  localPluginCompletionElementSelfClosing(api)
  localPluginCompletionElementAutoRenameTag(api)
  localPluginHighlightElementMatchingTag(api)
}

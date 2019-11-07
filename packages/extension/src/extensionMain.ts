import * as vscode from 'vscode'
import { LocalPluginApi } from './local-plugin-api/localPluginApi'
import { createLanguageClientProxy } from './local-plugin-api/languageClientProxy/languageClientProxy'
import { createVscodeProxy } from './local-plugin-api/vscodeProxy/vscodeProxy'
import { localPluginLanguageConfiguration } from './local-plugins/local-plugin-language-configuration/localPluginLanguageConfiguration'
import { localPluginAutoCompletionElementAutoClose } from './local-plugins/local-plugin-auto-completion-element-auto-close/localPluginAutoCompletionElementAutoClose'
import { localPluginAutoCompletionElementClose } from './local-plugins/local-plugin-auto-completion-element-close/localPluginAutoCompletionElementClose'
import { localPluginAutoCompletionElementRenameTag } from './local-plugins/local-plugin-auto-completion-element-rename-tag/localPluginAutoCompletionElementRenameTag'
import { localPluginAutoCompletionElementSelfClosing } from './local-plugins/local-plugin-auto-completion-element-self-closing/localPluginAutoCompletionElementSelfClosing'
import { localPluginHighlightElementMatchingTag } from './local-plugins/local-plugin-highlight-element-matching-tag/localPluginHighlightElementMatchingTag'
import { localPluginConfigs } from './local-plugins/local-plugin-configs/localPluginConfigs'
import { localPluginWrapSelectionWithTag } from './local-plugins/local-plugin-wrap-selection-with-tag/localPluginWrapSelectionWithTag'

export const activate: (
  context: vscode.ExtensionContext
) => Promise<void> = async context => {
  const api: LocalPluginApi = {
    languageClientProxy: await createLanguageClientProxy(context),
    vscodeProxy: createVscodeProxy(context),
    autoRenameTagPromise: undefined,
    context,
  }
  localPluginLanguageConfiguration(api)

  localPluginAutoCompletionElementAutoClose(api)
  localPluginAutoCompletionElementClose(api)
  localPluginAutoCompletionElementRenameTag(api)
  localPluginAutoCompletionElementSelfClosing(api)

  localPluginWrapSelectionWithTag(api)

  localPluginHighlightElementMatchingTag(api)

  localPluginConfigs(api)
}

import * as vscode from 'vscode'
import { LocalPluginApi } from './local-plugin-api/localPluginApi'
import { createLanguageClientProxy } from './local-plugin-api/languageClientProxy/languageClientProxy'
import { createVscodeProxy } from './local-plugin-api/vscodeProxy/vscodeProxy'
import { localPluginAutoCompletionElementAutoClose } from './local-plugins/local-plugin-auto-completion-element-auto-close/localPluginAutoCompletionElementAutoClose'
import { localPluginAutoCompletionElementRenameTag } from './local-plugins/local-plugin-auto-completion-element-rename-tag/localPluginAutoCompletionElementRenameTag'
import { localPluginAutoCompletionElementSelfClosing } from './local-plugins/local-plugin-auto-completion-element-self-closing/localPluginAutoCompletionElementSelfClosing'
import { localPluginHighlightElementMatchingTag } from './local-plugins/local-plugin-highlight-element-matching-tag/localPluginHighlightElementMatchingTag'
import { localPluginWrapSelectionWithTag } from './local-plugins/local-plugin-wrap-selection-with-tag/localPluginWrapSelectionWithTag'
import { localPluginAutoCompletionInsertQuotesAfterEqualSign } from './local-plugins/local-plugin-auto-completion-insert-quotes-after-equal-sign/localPluginAutoCompletionInsertQuotesAfterEqualSign'
import { utils } from './local-plugin-api/utils/utils'
import { localPluginShowWarningMessageOnLargeFiles } from './local-plugins/local-plugin-show-warning-message-on-large-files/localPluginShowWarningMessageOnLargeFiles'
import { replaceConfigs } from '@html-language-features/html-language-service'
import { constants } from './constants'

export const activate: (
  context: vscode.ExtensionContext
) => Promise<void> = async context => {
  const api: LocalPluginApi = {
    languageClientProxy: await createLanguageClientProxy(context),
    vscodeProxy: createVscodeProxy(context),
    utils,
    autoRenameTagPromise: undefined,
  }
  localPluginAutoCompletionElementRenameTag(api)
  localPluginAutoCompletionElementAutoClose(api)
  localPluginAutoCompletionElementSelfClosing(api)
  localPluginAutoCompletionInsertQuotesAfterEqualSign(api)
  localPluginWrapSelectionWithTag(api)
  // localPluginHighlightElementMatchingTag(api)

  localPluginShowWarningMessageOnLargeFiles(api)

  replaceConfigs([constants.config], 'html-missing-features-default')
}

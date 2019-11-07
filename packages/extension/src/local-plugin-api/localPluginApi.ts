import { LanguageClientProxy } from './languageClientProxy/languageClientProxy'
import { VscodeProxy } from './vscodeProxy/vscodeProxy'
import { Disposable } from 'vscode'

export type LocalPluginApi = {
  readonly vscodeProxy: VscodeProxy
  readonly languageClientProxy: LanguageClientProxy
  readonly context: {
    readonly subscriptions: {
      readonly push: (disposable: Disposable) => void
    }
  }
  /**
   * see local-plugin/local-plugin-highlight-matching-tag for why this property is necessary
   */
  autoRenameTagPromise: Promise<void> | undefined
}

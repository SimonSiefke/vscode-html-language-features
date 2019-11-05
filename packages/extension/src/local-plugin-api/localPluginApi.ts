import { LanguageClientProxy } from './languageClientProxy/languageClientProxy'
import { VscodeProxy } from './vscodeProxy/vscodeProxy'

export type LocalPluginApi = {
  readonly vscodeProxy: VscodeProxy
  readonly languageClientProxy: LanguageClientProxy
  /**
   * see local-plugin/local-plugin-highlight-matching-tag for why this property is necessary
   */
  autoRenameTagPromise: Promise<void> | undefined
}

import { LanguageClientProxy } from './languageClientProxy/languageClientProxy'
import { VscodeProxy } from './vscodeProxy/vscodeProxy'

export type LocalPluginApi = Readonly<{
  vscodeProxy: VscodeProxy
  languageClientProxy: LanguageClientProxy
}>

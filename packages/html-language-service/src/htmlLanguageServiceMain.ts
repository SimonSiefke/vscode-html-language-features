export {
  doSuggestionAttributeValue,
} from './services/suggestion-attribute-value/suggestionAttributeValue'

export {
  addConfigs,
  setConfig,
  getDescriptionForTag,
  getDescriptionForAttributeName,
  getReferenceForAttributeName,
  getDescriptionForAttributeValue,
  getReferenceForTag,
  NamedAttribute,
  NamedAttributeValue,
  NamedSubTag as NamedTag,
} from './data/Data'
export { doHoverElement } from './services/hover-element/hoverElement'
export {
  findMatchingTags,
  MatchingTagResult,
} from './services/util/findMatchingTags/findMatchingTags'
export {
  doSuggestionAttributeName,
} from './services/suggestion-attribute-name/suggestionAttributeName'
export {
  doSuggestionElementStartTag,
} from './services/suggestion-element-start-tag/suggestionElementStartTag'
export {
  doCompletionElementAutoClose,
} from './services/completion-element-auto-close/completionElementAutoClose'
export {
  doCompletionElementAutoRenameTag,
} from './services/completion-element-auto-rename-tag/autoRenameTagCompletion'
export {
  doCompletionElementClose,
} from './services/completion-element-close/completionElementClose'
export {
  doCompletionElementExpand,
} from './services/completion-element-expand/completionElementExpand'
export {
  doCompletionElementSelfClosing,
} from './services/completion-element-self-closing/completionElementSelfClosing'

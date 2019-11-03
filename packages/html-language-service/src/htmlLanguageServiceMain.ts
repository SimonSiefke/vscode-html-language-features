export {
  AttributeInfo,
  AttributeValueInfo,
  Config,
  Reference,
  Snippet,
  SubTag,
  Tag,
  ValidationError,
} from '@html-language-features/schema'
export {
  addConfigs,
  getDescriptionForAttributeName,
  getDescriptionForAttributeValue,
  getDescriptionForTag,
  getReferenceForAttributeName,
  getReferenceForTag,
  getSuggestedTags,
  isSelfClosingTag,
  NamedAttribute,
  NamedAttributeValue,
  NamedTag,
  setConfigs as setConfig,
  shouldHaveNewline,
  isDeprecatedTag,
} from './Data/Data'
export {
  doCompletionElementAutoClose,
} from './services/completion-element-auto-close/completionElementAutoClose'
export {
  doCompletionElementAutoRenameTag,
} from './services/completion-element-auto-rename-tag/autoRenameTagCompletion'
export {
  doCompletionElementClose,
} from './services/completion-element-close/completionElementClose'
// export {
//   doCompletionElementExpand,
// } from './services/completion-element-expand/completionElementExpand'
export {
  doCompletionElementSelfClosing,
} from './services/completion-element-self-closing/completionElementSelfClosing'
export { doHoverElement } from './services/hover-element/hoverElement'
export {
  doSuggestionAttributeName,
} from './services/suggestion-attribute-name/suggestionAttributeName'
export {
  doSuggestionAttributeValue,
} from './services/suggestion-attribute-value/suggestionAttributeValue'
export {
  doSuggestionElementExpand,
} from './services/suggestion-element-expand/suggestionElementExpand'
export {
  doSuggestionElementStartTag,
} from './services/suggestion-element-start-tag/suggestionElementStartTag'
export {
  findMatchingTags,
  MatchingTagResult,
} from './services/util/findMatchingTags/findMatchingTags'

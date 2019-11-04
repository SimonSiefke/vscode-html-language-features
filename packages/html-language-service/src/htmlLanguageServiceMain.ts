export { doHoverElement } from './services/hover-element/hoverElement'

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
  isDeprecatedTag,
  isSelfClosingTag,
  NamedAttribute,
  NamedAttributeValue,
  NamedTag,
  removeConfigs,
  setConfigs as setConfig,
  shouldHaveNewline,
} from './Data/Data'
export {
  doAutoCompletionElementAutoClose,
} from './services/auto-completion-element-auto-close/autoCompletionElementAutoClose'
export {
  doAutoCompletionElementClose,
} from './services/auto-completion-element-close/autoCompletionElementClose'
export {
  doAutoCompletionElementRenameTag,
} from './services/auto-completion-element-rename-tag/autoCompletionElementRenameTag'
export {
  doAutoCompletionElementSelfClosing,
} from './services/auto-completion-element-self-closing/autoCompletionElementSelfClosing'
export {
  doCompletionAttributeName,
} from './services/completion-attribute-name/completionAttributeName'
export {
  doCompletionAttributeValue,
} from './services/completion-attribute-value/completionAttributeValue'
export {
  doCompletionElementExpand,
} from './services/completion-element-expand/suggestionElementExpand'
export {
  doCompletionElementStartTag,
} from './services/completion-element-start-tag/completionElementStartTag'
export {
  findMatchingTags,
  MatchingTagResult,
} from './services/util/findMatchingTags/findMatchingTags'

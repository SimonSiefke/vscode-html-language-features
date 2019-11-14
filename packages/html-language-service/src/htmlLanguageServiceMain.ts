export { doCompletionElementWrapSelectionWithTag } from './services/command-element-wrap-selection-with-tag/commandElementWrapSelectionWithTag'

export { doCompletionElementSimpleDocument } from './services/completion-element-simple-document/completionElementSimpleDocument'

export { doCompletionEntity } from './services/completion-entity/completionEntity'

export { doHoverElement } from './services/hover-element/hoverElement'
export {
  AttributeInfo,
  AttributeValueInfo,
  AttributeType,
  Config,
  Reference,
  Snippet,
  SubTag,
  Tag,
  ValidationError,
} from '@html-language-features/schema'
export {
  getDescriptionForAttributeName,
  getDescriptionForAttributeValue,
  getDescriptionForTag,
  getReferenceForAttributeName,
  replaceConfigs,
  getReferenceForTag,
  getSuggestedTags,
  isDeprecatedTag,
  isSelfClosingTag,
  isDeprecatedAttribute,
  NamedAttributeValue,
  shouldHaveNewline,
  isDeprecatedAttributeValue,
} from './Data/Data'
export { doAutoCompletionElementAutoClose } from './services/auto-completion-element-auto-close/autoCompletionElementAutoClose'
export { doAutoCompletionElementClose } from './services/auto-completion-element-close/autoCompletionElementClose'
export { doAutoCompletionElementRenameTag } from './services/auto-completion-element-rename-tag/autoCompletionElementRenameTag'
export { doAutoCompletionElementSelfClosing } from './services/auto-completion-element-self-closing/autoCompletionElementSelfClosing'
export { doCompletionAttributeName } from './services/completion-attribute-name/completionAttributeName'
export { doCompletionAttributeValue } from './services/completion-attribute-value/completionAttributeValue'
export { doCompletionElementExpand } from './services/completion-element-expand/suggestionElementExpand'
export { doCompletionElementStartTag } from './services/completion-element-start-tag/completionElementStartTag'
export {
  findMatchingTags,
  MatchingTagResult,
} from './services/util/findMatchingTags/findMatchingTags'

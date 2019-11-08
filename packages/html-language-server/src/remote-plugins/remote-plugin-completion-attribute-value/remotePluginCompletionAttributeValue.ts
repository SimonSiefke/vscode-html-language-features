import {
  doCompletionAttributeValue,
  NamedAttributeValue,
  AttributeType,
  isDeprecatedAttributeValue,
} from '@html-language-features/html-language-service'
import {
  CompletionItem,
  CompletionItemKind,
  CompletionItemTag,
  InsertTextFormat,
  Position,
  Range,
} from 'vscode-languageserver'
import { constants } from '../../constants'
import { getDocumentationForAttributeValue } from '../../util/getDocumentation'
import { RemotePlugin } from '../remotePlugin'

interface Data {
  tagName: string
  attributeName: string
  attributeValue: string
}

type CompletionItemWithData = CompletionItem & { data: Data }

const kind = CompletionItemKind.Value
const insertTextFormat = InsertTextFormat.Snippet

const createCompletionItemForAttributeValue: (
  tagName: string,
  attributeName: string,
  attributeValue: string
) => CompletionItemWithData | undefined = (
  tagName,
  attributeName,
  attributeValue
) => {
  const completionItem: CompletionItemWithData = {
    data: {
      attributeName,
      tagName: tagName,
      attributeValue: attributeValue,
    },
    insertText: attributeValue,
    insertTextFormat,
    kind,
    label: attributeValue,
  }
  if (isDeprecatedAttributeValue(tagName, attributeName, attributeValue)) {
    if (constants.showDeprecatedCompletions === true) {
      completionItem.tags = [CompletionItemTag.Deprecated]
    } else {
      return undefined
    }
  }
  return completionItem
}

const createCompletionItemsForAttributeType: (
  attributeType: AttributeType
) => CompletionItem[] = attributeType => {
  if (attributeType === 'boolean') {
    return ['true', 'false'].map(value => {
      const completionItem: CompletionItem = {
        insertText: value,
        label: value,
        kind,
      }
      return completionItem
    })
  }
  console.error('unknown attribute type')
  return []
}

export const remotePluginCompletionAttributeValue: RemotePlugin = api => {
  api.connectionProxy.onCompletion(
    'completion-attribute-value',
    ({ textDocument, position }) => {
      const document = api.documentsProxy.get(textDocument.uri)
      if (!document) {
        return undefined
      }
      const text = document.getText(
        Range.create(Position.create(0, 0), position)
      )
      const offset = document.offsetAt(position)
      const result = doCompletionAttributeValue(text, offset)
      if (!result) {
        return undefined
      }
      if ('attributeValues' in result) {
        const items = result.attributeValues
          .map(attributeValue =>
            createCompletionItemForAttributeValue(
              result.tagName,
              result.attributeName,
              attributeValue
            )
          )
          .filter(Boolean) as CompletionItemWithData[]
        if (items.length === 0) {
          return undefined
        }
        return {
          isIncomplete: false,
          items,
        }
      } else {
        const items = createCompletionItemsForAttributeType(
          result.attributeType
        )
        if (items.length === 0) {
          return undefined
        }
        return {
          isIncomplete: false,
          items,
        }
      }
    }
  )

  api.connectionProxy.onCompletionResolve(
    'completion-attribute-value',
    params => {
      if (!params.data) {
        return params
      }
      const { tagName, attributeName, attributeValue } = params.data as Data
      const documentation = getDocumentationForAttributeValue(
        tagName,
        attributeName,
        attributeValue
      )
      params.documentation = documentation
      return params
    }
  )
}

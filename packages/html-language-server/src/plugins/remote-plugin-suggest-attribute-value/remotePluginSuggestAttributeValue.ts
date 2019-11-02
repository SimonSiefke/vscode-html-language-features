import { RemotePlugin } from '../remotePluginApi'
import {
  CompletionItemKind,
  CompletionItem,
  TextDocument,
  Range,
  Position,
  CompletionItemTag,
  InsertTextFormat,
} from 'vscode-languageserver-types'
import {
  NamedAttributeValue,
  doSuggestionAttributeValue,
} from '@html-language-features/html-language-service'
import { getDocumentationForAttributeValue } from '../../util/getDocumentation'
import { settings } from '../../Settings'

interface Data {
  tagName: string
  attributeName: string
  attributeValue: string
}

type CompletionItemWithData = CompletionItem & { data: Data }

const kind = CompletionItemKind.Value
const insertTextFormat = InsertTextFormat.Snippet

const createCompletionItem: ({
  tagName,
  attributeName,
  attributeValue,
}: {
  tagName: string
  attributeName: string
  attributeValue: NamedAttributeValue
}) => CompletionItemWithData | undefined = ({
  tagName,
  attributeName,
  attributeValue,
}) => {
  const completionItem: CompletionItemWithData = {
    data: {
      attributeName,
      tagName: tagName,
      attributeValue: attributeValue.name,
    },
    insertText: attributeValue.name,
    insertTextFormat,
    kind,
    label: attributeValue.name,
  }
  if (attributeValue.deprecated) {
    if (settings.showDeprecatedSuggestions === true) {
      completionItem.tags = [CompletionItemTag.Deprecated]
    } else {
      return undefined
    }
  }
  return completionItem
}

export const remotePluginSuggestionAttributeValue: RemotePlugin = api => {
  api.languageServer.onCompletion(
    'suggestion-attribute-value',
    ({ textDocument, position }) => {
      const document = api.documents.get(textDocument.uri) as TextDocument
      const text = document.getText(
        Range.create(Position.create(0, 0), position)
      )
      const offset = document.offsetAt(position)
      const result = doSuggestionAttributeValue(text, offset)
      if (result === undefined) {
        return undefined
      }
      const items = result.attributeValues
        .map(attributeValue =>
          createCompletionItem({
            tagName: result.tagName,
            attributeName: result.attributeName,
            attributeValue,
          })
        )
        .filter(Boolean) as CompletionItemWithData[]
      if (items.length === 0) {
        return undefined
      }
      return {
        isIncomplete: false,
        items,
      }
    }
  )

  api.languageServer.onCompletionResolve(
    'suggestion-attribute-value',
    params => {
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

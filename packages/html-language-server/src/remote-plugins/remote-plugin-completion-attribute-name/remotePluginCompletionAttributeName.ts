import { doCompletionAttributeName } from '@html-language-features/html-language-service'
import {
  getAttributeType,
  isDeprecatedAttribute,
} from '@html-language-features/html-language-service/dist/Data/Data'
import {
  CompletionItem,
  CompletionItemKind,
  InsertTextFormat,
  Position,
  Range,
  CompletionItemTag,
} from 'vscode-languageserver'
import { getDocumentationForAttributeName } from '../../util/getDocumentation'
import { RemotePlugin } from '../remotePlugin'
import { constants } from '../../constants'

interface Data {
  tagName: string
  attributeName: string
}

type CompletionItemWithData = CompletionItem & { data: Data }

const kind = CompletionItemKind.Value
const insertTextFormat = InsertTextFormat.Snippet

const createCompletionItemForAttributeValue: (
  attributeName: string,
  attributeValue: string
) => CompletionItem = (attributeName, attributeValue) => {
  const insertText = `${attributeName}=${constants.quote}${attributeValue}${constants.quote}`
  const completionItem: CompletionItem = {
    insertText,
    insertTextFormat,
    kind,
    label: `${attributeName}=${constants.quote}${attributeValue}${constants.quote}`,
  }
  return completionItem
}

const createCompletionItemsForAttributeValues: (attribute: {
  name: string
  attributeOnlyScore: number
  attributeValueScores?: { value: string; score: number }[]
}) => CompletionItem[] = attribute => {
  // console.log(JSON.stringify(attribute))
  return (attribute.attributeValueScores || []).map(attributeValue =>
    createCompletionItemForAttributeValue(attribute.name, attributeValue.value)
  )
}
const createCompletionItemForAttributeName: (
  tagName: string,
  attribute: {
    name: string
    attributeOnlyScore: number
  }
) => CompletionItemWithData | undefined = (tagName, attribute) => {
  const attributeType = getAttributeType(tagName, attribute.name)
  let insertText: string
  let command: { title: string; command: string } | undefined
  if (attributeType === 'boolean') {
    insertText = attribute.name
  } else {
    insertText = `${attribute.name}=${constants.quote}$1${constants.quote}`
    command = {
      title: 'Suggest',
      command: 'editor.action.triggerSuggest',
    }
  }
  const completionItem: CompletionItemWithData = {
    data: {
      attributeName: attribute.name,
      tagName,
    },
    insertText,
    insertTextFormat,
    kind,
    label: attribute.name,
    command,
  }
  if (isDeprecatedAttribute(tagName, attribute.name)) {
    if (constants.showDeprecatedCompletions === true) {
      completionItem.tags = [CompletionItemTag.Deprecated]
    } else {
      return undefined
    }
  }

  return completionItem
}

export const remotePluginCompletionAttributeName: RemotePlugin = api => {
  api.connectionProxy.onCompletion(
    'completion-attribute-name',
    ({ textDocument, position }) => {
      const document = api.documentsProxy.get(textDocument.uri)
      if (!document) {
        return undefined
      }
      const text = document.getText(
        Range.create(Position.create(0, 0), position)
      )
      const offset = document.offsetAt(position)
      const result = doCompletionAttributeName(text, offset)
      if (!result) {
        return undefined
      }
      const completionItemsForAttributeValues = result.attributes
        .flatMap(attribute => {
          const completionItemsForAttributeValues = createCompletionItemsForAttributeValues(
            attribute
          )
          return completionItemsForAttributeValues
        })
        .filter(Boolean) as CompletionItem[]

      const completionItemsForAttributeName = result.attributes
        .map(attribute =>
          createCompletionItemForAttributeName(result.tagName, attribute)
        )
        .filter(Boolean) as CompletionItemWithData[]

      let completionItems: CompletionItem[]
      if (completionItemsForAttributeValues.length > 0) {
        completionItems = completionItemsForAttributeValues
      } else {
        completionItems = completionItemsForAttributeName
      }

      if (completionItems.length === 0) {
        return undefined
      }
      return {
        isIncomplete: true,
        items: completionItems,
      }
    }
  )

  api.connectionProxy.onCompletionResolve(
    'completion-attribute-name',
    params => {
      if (!params.data) {
        return params
      }
      const { tagName, attributeName } = params.data as Data
      const documentation = getDocumentationForAttributeName(
        tagName,
        attributeName
      )
      params.documentation = documentation
      return params
    }
  )
}

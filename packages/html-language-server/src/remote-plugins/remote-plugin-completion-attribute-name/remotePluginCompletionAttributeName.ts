import { RemotePlugin } from '../remotePlugin'
import {
  CompletionItemKind,
  CompletionItem,
  Range,
  Position,
  InsertTextFormat,
} from 'vscode-languageserver-types'
import { doCompletionAttributeName } from '@html-language-features/html-language-service'
import { getDocumentationForAttributeName } from '../../util/getDocumentation'
import { getAttributeType } from '@html-language-features/html-language-service/dist/Data/Data'

interface Data {
  tagName: string
  attributeName: string
}

type CompletionItemWithData = CompletionItem & { data: Data }

const kind = CompletionItemKind.Value
const insertTextFormat = InsertTextFormat.Snippet

const createCompletionItem: (
  tagName: string,
  attributeName: string
) => CompletionItemWithData | undefined = (tagName, attributeName) => {
  const attributeType = getAttributeType(tagName, attributeName)
  let insertText: string
  if (attributeType === 'boolean') {
    insertText = attributeName
  } else {
    insertText = `${attributeName}="$1"`
  }
  const completionItem: CompletionItemWithData = {
    data: {
      attributeName: attributeName,
      tagName,
    },
    insertText,
    insertTextFormat,
    kind,
    label: attributeName,
  }

  // if (attributeName.deprecated === true) {
  //   if (constants.showDeprecatedCompletions === true) {
  //     completionItem.tags = [CompletionItemTag.Deprecated]
  //   } else {
  //     return undefined
  //   }
  // }
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
      const items = result.attributes
        .map(attributeName =>
          createCompletionItem(result.tagName, attributeName)
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

  api.connectionProxy.onCompletionResolve(
    'completion-attribute-name',
    params => {
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

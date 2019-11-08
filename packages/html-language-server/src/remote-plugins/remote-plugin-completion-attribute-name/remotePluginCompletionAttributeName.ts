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

const createCompletionItem: (
  tagName: string,
  attributeName: string
) => CompletionItemWithData | undefined = (tagName, attributeName) => {
  const attributeType = getAttributeType(tagName, attributeName)
  let insertText: string
  let command: { title: string; command: string } | undefined
  if (attributeType === 'boolean') {
    insertText = attributeName
  } else {
    insertText = `${attributeName}=${constants.quote}$1${constants.quote}`
    command = {
      title: 'Suggest',
      command: 'editor.action.triggerSuggest',
    }
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
    command,
  }
  if (isDeprecatedAttribute(tagName, attributeName)) {
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

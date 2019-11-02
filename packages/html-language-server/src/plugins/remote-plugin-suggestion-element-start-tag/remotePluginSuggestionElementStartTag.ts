import { RemotePlugin } from '../remotePluginApi'
import {
  CompletionItem,
  CompletionItemKind,
  TextDocument,
  Range,
  Position,
  CompletionItemTag,
  InsertTextFormat,
} from 'vscode-languageserver-types'
import {
  doSuggestionElementStartTag,
  NamedTag,
  isDeprecatedTag,
} from '@html-language-features/html-language-service'
import { getDocumentationForTagName } from '../../util/getDocumentation'
import { settings } from '../../Settings'

interface Data {
  tagName: string
}

type CompletionItemWithData = CompletionItem & { data: Data }

const blueishIcon = CompletionItemKind.Variable
const insertTextFormat = InsertTextFormat.PlainText

const createCompletionItem: (
  item: NamedTag
) => CompletionItemWithData | undefined = item => {
  const completionItem: CompletionItemWithData = {
    data: {
      tagName: item.name,
    },
    insertText: item.name,
    insertTextFormat,
    kind: blueishIcon,
    label: item.name,
  }
  if (isDeprecatedTag(item.name)) {
    if (settings.showDeprecatedSuggestions === true) {
      completionItem.tags = [CompletionItemTag.Deprecated]
    } else {
      return undefined
    }
  }
  return completionItem
}

export const remotePluginSuggestionElementStartTag: RemotePlugin = api => {
  api.languageServer.onCompletion(
    'suggestion-element-start-tag',
    ({ textDocument, position }) => {
      const document = api.documents.get(textDocument.uri) as TextDocument
      const text = document.getText(
        Range.create(Position.create(0, 0), position)
      )
      const offset = document.offsetAt(position)
      const result = doSuggestionElementStartTag(text, offset)
      if (result === undefined) {
        return undefined
      }
      const items = result
        .map(createCompletionItem)
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
    'suggestion-element-start-tag',
    params => {
      const { tagName } = params.data as Data
      const documentation = getDocumentationForTagName(tagName)
      params.documentation = documentation
      return params
    }
  )
}

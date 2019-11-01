import { RemotePlugin } from '../remotePluginApi'
import {
  CompletionItem,
  CompletionItemKind,
  TextDocument,
  Range,
  Position,
} from 'vscode-languageserver-types'
import {
  doSuggestionElementStartTag,
  NamedTag,
} from '@html-language-features/html-language-service'
import { getDocumentationForTagName } from '../../util/getDocumentation'

const blueishIcon = CompletionItemKind.Variable

interface Data {
  tagName: string
}

const createCompletionItem: (
  item: NamedTag
) => CompletionItem & { data: Data } = item => {
  return {
    kind: blueishIcon,
    insertText: item.name,
    label: item.name,
    data: {
      tagName: item.name,
    },
  }
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
      return {
        isIncomplete: false,
        items: result.map(createCompletionItem),
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

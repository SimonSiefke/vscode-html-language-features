import { RemotePlugin } from '../remotePlugin'
import {
  CompletionItem,
  CompletionItemKind,
  Range,
  Position,
  CompletionItemTag,
  InsertTextFormat,
} from 'vscode-languageserver-types'
import {
  doCompletionElementStartTag,
  isDeprecatedTag,
} from '@html-language-features/html-language-service'
import { getDocumentationForTagName } from '../../util/getDocumentation'
import { constants } from '../../constants'

interface Data {
  tagName: string
}

type CompletionItemWithData = CompletionItem & { data: Data }

const blueishIcon = CompletionItemKind.Variable
const insertTextFormat = InsertTextFormat.PlainText

const createCompletionItem: (
  item: string
) => CompletionItemWithData | undefined = item => {
  const completionItem: CompletionItemWithData = {
    data: {
      tagName: item,
    },
    kind: blueishIcon,
    label: item,
    insertText: item,
    insertTextFormat,
  }
  if (isDeprecatedTag(item)) {
    if (constants.showDeprecatedCompletions === true) {
      completionItem.tags = [CompletionItemTag.Deprecated]
    } else {
      return undefined
    }
  }
  return completionItem
}

export const remotePluginCompletionElementStartTag: RemotePlugin = api => {
  api.connectionProxy.onCompletion(
    'completion-element-start-tag',
    ({ textDocument, position }) => {
      const document = api.documentsProxy.get(textDocument.uri)
      if (!document) {
        return undefined
      }
      const text = document.getText(
        Range.create(Position.create(0, 0), position)
      )
      const offset = document.offsetAt(position)
      const result = doCompletionElementStartTag(text, offset)
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

  api.connectionProxy.onCompletionResolve(
    'completion-element-start-tag',
    params => {
      const { tagName } = params.data as Data
      const documentation = getDocumentationForTagName(tagName)
      params.documentation = documentation
      return params
    }
  )
}

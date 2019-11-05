import { RemotePlugin } from '../remotePlugin'
import { doCompletionElementSimpleDocument } from '@html-language-features/html-language-service'
import {
  CompletionItem,
  CompletionItemKind,
  Range,
  Position,
  TextEdit,
  InsertTextFormat,
} from 'vscode-languageserver'

const blueishIcon = CompletionItemKind.Variable
const insertTextFormat = InsertTextFormat.Snippet

const createCompletionItem: (item: string, range: Range) => CompletionItem = (
  item,
  range
) => {
  return {
    label: '!',
    kind: blueishIcon,
    insertTextFormat,
    textEdit: TextEdit.replace(range, item),
    detail: 'Simple Html Document',
  }
}

export const remotePluginCompletionElementSimpleDocument: RemotePlugin = api => {
  api.connectionProxy.onCompletion(
    'completion-element-simple-document',
    ({ textDocument, position }) => {
      const document = api.documentsProxy.get(textDocument.uri)
      if (!document) {
        return undefined
      }
      const text = document.getText()
      const offset = document.offsetAt(position)
      const results = doCompletionElementSimpleDocument(text, offset)
      const range = Range.create(
        Position.create(position.line, position.character - 1),
        position
      )
      const items = results.map(result => createCompletionItem(result, range))
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
    'completion-element-simple-document',
    params => params
  )
}

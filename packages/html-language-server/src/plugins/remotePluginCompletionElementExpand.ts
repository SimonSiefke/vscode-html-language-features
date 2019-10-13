import { doCompletionElementAutoClose } from 'html-language-service'
import { RequestType } from 'vscode-jsonrpc'
import {
  TextDocumentPositionParams,
  TextDocument,
  Range,
  Position,
} from 'vscode-languageserver'

export const pluginCompletionElementAutoClose = api => {
  api.onRequest(
    new RequestType<TextDocumentPositionParams, string | undefined, any, any>(
      'html/end-tag-auto-close'
    ),
    async ({ textDocument, position }) => {
      const document = api.documents.get(textDocument.uri) as TextDocument
      const text = document.getText(
        Range.create(Position.create(0, 0), position)
      )
      const offset = document.offsetAt(position)
      return doCompletionElementAutoClose(text, offset)
    }
  )
}

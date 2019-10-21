import { RemotePlugin } from '../remotePluginApi'
import {
  RequestType,
  TextDocumentPositionParams,
  Range,
  Position,
  TextDocument,
} from 'vscode-languageserver'
import { doCompletionElementAutoRenameTag } from 'html-language-service'

type Result = {
  startOffset: number
  endOffset: number
  word: string
}

const requestType = new RequestType<
  TextDocumentPositionParams,
  Result | undefined,
  any,
  any
>('html/completion-element-auto-rename-tag')

export const remotePluginCompletionElementAutoRenameTag: RemotePlugin = api => {
  api.languageServer.onRequest(
    requestType,
    async ({ textDocument, position }) => {
      const document = api.documents.get(textDocument.uri) as TextDocument
      const text = document.getText()
      const offset = document.offsetAt(position)
      return doCompletionElementAutoRenameTag(text, offset)
    }
  )
}

import { doCompletionElementAutoRenameTag } from '@html-language-features/html-language-service'
import { RequestType, TextDocumentPositionParams } from 'vscode-languageserver'
import { TextDocument } from 'vscode-languageserver-types'
import { RemotePlugin } from '../remotePluginApi'

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

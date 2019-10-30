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
      // TODO figure out a better way so that auto rename tag works reliably
      // when the requests are not throttled, a completion for e request can change the document
      // bug the next completion has still the old document and makes the wrong edits
      await new Promise(resolve => setTimeout(resolve, 100))
      return doCompletionElementAutoRenameTag(text, offset)
    }
  )
}

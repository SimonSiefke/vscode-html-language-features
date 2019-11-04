import { doCompletionElementAutoClose } from '@html-language-features/html-language-service'
import { RequestType, TextDocumentPositionParams } from 'vscode-languageserver'
import { Position, Range } from 'vscode-languageserver-types'
import { RemotePlugin } from '../remotePlugin'

type Result = {
  completionString: string
  completionOffset: number
}

const requestType = new RequestType<
  TextDocumentPositionParams,
  Result | undefined,
  any,
  any
>('html/completion-element-auto-close')

export const remotePluginCompletionElementAutoClose: RemotePlugin = api => {
  api.connectionProxy.onRequest(
    requestType,
    async ({ textDocument, position }) => {
      const document = api.documents.get(textDocument.uri)
      if (!document) {
        return undefined
      }
      const text = document.getText(
        Range.create(Position.create(0, 0), position)
      )
      const offset = document.offsetAt(position)
      return doCompletionElementAutoClose(text, offset)
    }
  )
}

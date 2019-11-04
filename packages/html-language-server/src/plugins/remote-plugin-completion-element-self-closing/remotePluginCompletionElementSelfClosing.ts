import { RemotePlugin } from '../remotePlugin'
import { Range, Position } from 'vscode-languageserver-types'
import { doCompletionElementSelfClosing } from '@html-language-features/html-language-service'
import { RequestType, TextDocumentPositionParams } from 'vscode-languageserver'

type Result = {
  completionString: string
  completionOffset: number
}

const requestType = new RequestType<
  TextDocumentPositionParams,
  Result | undefined,
  any,
  any
>('html/completion-element-self-closing')

export const remotePluginCompletionElementSelfClosing: RemotePlugin = api => {
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
      return doCompletionElementSelfClosing(text, offset)
    }
  )
}

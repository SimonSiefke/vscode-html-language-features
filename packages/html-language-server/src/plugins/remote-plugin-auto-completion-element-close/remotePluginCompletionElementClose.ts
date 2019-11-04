import { RemotePlugin } from '../remotePlugin'
import { doAutoCompletionElementClose } from '@html-language-features/html-language-service'
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
>('html/auto-completion-element-close')

export const remotePluginCompletionElementClose: RemotePlugin = api => {
  api.connectionProxy.onRequest(
    requestType,
    async ({ textDocument, position }) => {
      const document = api.documents.get(textDocument.uri)
      if (!document) {
        return undefined
      }
      const text = document.getText()
      const offset = document.offsetAt(position)
      return doAutoCompletionElementClose(text, offset)
    }
  )
}

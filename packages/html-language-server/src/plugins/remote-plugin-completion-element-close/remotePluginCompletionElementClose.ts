import { RemotePlugin } from '../remotePluginApi'
import {
  RequestType,
  TextDocumentPositionParams,
  TextDocument,
} from 'vscode-languageserver'
import { doCompletionElementClose } from '@html-language-features/html-language-service'

type Result = {
  completionString: string
  completionOffset: number
}

const requestType = new RequestType<
  TextDocumentPositionParams,
  Result | undefined,
  any,
  any
>('html/completion-element-close')

export const remotePluginCompletionElementClose: RemotePlugin = api => {
  api.languageServer.onRequest(
    requestType,
    async ({ textDocument, position }) => {
      const document = api.documents.get(textDocument.uri) as TextDocument
      const text = document.getText()
      const offset = document.offsetAt(position)
      return doCompletionElementClose(text, offset)
    }
  )
}

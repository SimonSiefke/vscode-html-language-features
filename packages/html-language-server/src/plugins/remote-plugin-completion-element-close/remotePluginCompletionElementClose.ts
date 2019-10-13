import { RemotePlugin } from '../remotePluginApi'
import {
  RequestType,
  TextDocumentPositionParams,
  TextDocument,
} from 'vscode-languageserver'
import { doCompletionElementClose } from 'html-language-service'

type Result = {
  completionString: string
  completionOffset: number
}

export const remotePluginCompletionElementClose: RemotePlugin = api => {
  api.languageServer.onRequest(
    new RequestType<TextDocumentPositionParams, Result | undefined, any, any>(
      'html/end-tag-close'
    ),
    async ({ textDocument, position }) => {
      const document = api.documents.get(textDocument.uri) as TextDocument
      const text = document.getText()
      const offset = document.offsetAt(position)
      return doCompletionElementClose(text, offset)
    }
  )
}

import { RemotePlugin } from '../remotePluginApi'
import {
  RequestType,
  TextDocumentPositionParams,
  Range,
  Position,
  TextDocument,
} from 'vscode-languageserver'
import { doCompletionElementAutoClose } from 'html-language-service'

type Result = {
  completionString:string
  completionOffset:number
}

export const remotePluginCompletionElementAutoClose: RemotePlugin = api => {
  api.languageServer.onRequest(
    new RequestType<TextDocumentPositionParams, Result | undefined, any, any>(
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

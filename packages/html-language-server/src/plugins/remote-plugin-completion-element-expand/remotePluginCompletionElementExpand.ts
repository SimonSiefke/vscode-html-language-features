import { RemotePlugin } from '../remotePluginApi'
import {
  Range,
  RequestType,
  TextDocumentPositionParams,
  Position,
  TextDocument,
} from 'vscode-languageserver'
import { doCompletionElementExpand } from 'html-language-service'

type Result = {
  completionString: string
  completionOffset: number
}

const requestType = new RequestType<
  TextDocumentPositionParams,
  Result,
  any,
  any
>('html/completion-element-expand')

export const remotePluginCompletionElementExpand: RemotePlugin = api => {
  api.languageServer.onRequest(
    requestType,
    async ({ textDocument, position }) => {
      const document = api.documents.get(textDocument.uri) as TextDocument
      const text = document.getText(
        Range.create(Position.create(0, 0), position)
      )
      const offset = document.offsetAt(position)
      return doCompletionElementExpand(text, offset)
    }
  )
}

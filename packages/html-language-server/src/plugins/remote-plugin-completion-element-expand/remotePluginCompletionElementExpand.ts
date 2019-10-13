import { RemotePlugin } from '../remotePluginApi'
import {
  Range,
  RequestType,
  TextDocumentPositionParams,
  Position,
  TextDocument,
} from 'vscode-languageserver'
import { doCompletionElementExpand } from 'html-language-service'

export const remotePluginCompletionElementExpand: RemotePlugin = api => {
  api.languageServer.onRequest(
    new RequestType<
      TextDocumentPositionParams,
      { completionString: string; completionOffset: number },
      any,
      any
    >('html/emmet-tag-completion'),
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

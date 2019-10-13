import { RemotePlugin } from '../remotePluginApi'
import {
  RequestType,
  TextDocumentPositionParams,
  TextDocument,
  Range,
  Position,
} from 'vscode-languageserver'
import { doCompletionElementSelfClosing } from 'html-language-service'

type Result = {
  completionString: string
  completionOffset: number
}

export const remotePluginCompletionElementSelfClosing: RemotePlugin = api => {
  api.languageServer.onRequest(
    new RequestType<TextDocumentPositionParams, Result | undefined, any, any>(
      'html/self-closing-tag-close-completion'
    ),
    async ({ textDocument, position }) => {
      const document = api.documents.get(textDocument.uri) as TextDocument
      const text = document.getText(
        Range.create(Position.create(0, 0), position)
      )
      console.log('do completion')
      const offset = document.offsetAt(position)
      return doCompletionElementSelfClosing(text, offset)
    }
  )
}

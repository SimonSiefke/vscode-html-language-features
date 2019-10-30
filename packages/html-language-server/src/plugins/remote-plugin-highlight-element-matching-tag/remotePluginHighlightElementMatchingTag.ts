import { RemotePlugin } from '../remotePluginApi'
import { TextDocument } from 'vscode-languageserver-types'
import {
  findMatchingTags,
  MatchingTagResult,
} from '@html-language-features/html-language-service'
import { RequestType, TextDocumentPositionParams } from 'vscode-languageserver'

type Result = MatchingTagResult

const requestType = new RequestType<
  TextDocumentPositionParams,
  Result | undefined,
  any,
  any
>('html/highlight-element-matching-tag')

export const remotePluginHighlightElementMatchingTag: RemotePlugin = api => {
  api.languageServer.onRequest(
    requestType,
    async ({ textDocument, position }) => {
      const document = api.documents.get(textDocument.uri) as TextDocument
      const text = document.getText()
      const offset = document.offsetAt(position)
      return findMatchingTags(text, offset)
    }
  )
}

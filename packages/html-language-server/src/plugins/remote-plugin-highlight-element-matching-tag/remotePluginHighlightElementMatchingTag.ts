import { RemotePlugin } from '../remotePluginApi'
import {
  RequestType,
  TextDocumentPositionParams,
  TextDocument,
} from 'vscode-languageserver'
import { findMatchingTags } from '@html-language-features/html-language-service'

type Result = {
  type: 'startAndEndTag'
  tagName: string
  startTagOffset: number
  endTagOffset: number
}

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

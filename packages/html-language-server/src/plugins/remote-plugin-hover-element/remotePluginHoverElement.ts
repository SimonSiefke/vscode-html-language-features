import { RemotePlugin } from '../remotePluginApi'
import {
  TextDocument,
  Range,
  Position,
  MarkupKind,
} from 'vscode-languageserver'
import { doHoverElement } from '@html-language-features/html-language-service'

export const remotePluginHoverElement: RemotePlugin = api => {
  api.languageServer.onHover(({ textDocument, position }) => {
    const document = api.documents.get(textDocument.uri) as TextDocument
    const text = document.getText()
    const offset = document.offsetAt(position)
    const result = doHoverElement(text, offset)
    if (!result) {
      return undefined
    }
    const startPosition = document.positionAt(result.startOffset)
    const endPosition = document.positionAt(result.endOffset)
    return {
      contents: {
        kind: MarkupKind.Markdown,
        value: result.content,
      },
      range: {
        start: startPosition,
        end: endPosition,
      },
    }
  })
}

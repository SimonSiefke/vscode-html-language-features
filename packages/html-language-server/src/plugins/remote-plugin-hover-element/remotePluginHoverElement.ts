import { RemotePlugin } from '../remotePlugin'
// import { TextDocument } from 'vscode-languageserver-types'
import { doHoverElement } from '@html-language-features/html-language-service'
import { getDocumentationForTagName } from '../../util/getDocumentation'

export const remotePluginHoverElement: RemotePlugin = api => {
  api.connectionProxy.onHover(({ textDocument, position }) => {
    const document = api.documents.get(textDocument.uri)
    if (!document) {
      return undefined
    }
    const text = document.getText()
    const offset = document.offsetAt(position)
    const result = doHoverElement(text, offset)
    if (!result) {
      return undefined
    }
    const documentation = getDocumentationForTagName(result.tagName)
    if (!documentation) {
      return undefined
    }
    const startPosition = document.positionAt(result.startOffset)
    const endPosition = document.positionAt(result.endOffset)
    return {
      contents: documentation,
      range: {
        start: startPosition,
        end: endPosition,
      },
    }
  })
}

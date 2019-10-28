import { LocalPlugin, LocalPluginApi } from '../localPluginApi'
import * as vsl from 'vscode-languageclient'
import * as vscode from 'vscode'

type Result = {
  type: 'startAndEndTag'
  tagName: string
  startTagOffset: number
  endTagOffset: number
}

const requestType = new vsl.RequestType<
  vsl.TextDocumentPositionParams,
  Result,
  any,
  any
>('html/highlight-element-matching-tag')

const highlightElementMatchingTagDecorationType = vscode.window.createTextEditorDecorationType(
  {
    borderWidth: '0 0 1px 0',
    borderStyle: 'solid',
    borderColor: 'yellow',
  }
)

const setDecorations: (
  decorationOffsets: [number, number][]
) => void = decorationOffsets => {
  const document = vscode.window.activeTextEditor.document
  const decorations: vscode.Range[] = decorationOffsets.map(
    ([startOffset, endOffset]) =>
      new vscode.Range(
        document.positionAt(startOffset),
        document.positionAt(endOffset)
      )
  )
  vscode.window.activeTextEditor.setDecorations(
    highlightElementMatchingTagDecorationType,
    decorations
  )
}

const askServerForHighlightElementMatchingTag: (
  api: LocalPluginApi,
  document: vscode.TextDocument,
  position: vscode.Position
) => Promise<void> = async (api, document, position) => {
  const params = api.languageClient.code2ProtocolConverter.asTextDocumentPositionParams(
    document,
    position
  )

  const result = await api.languageClient.sendRequest(requestType, params)
  if (!result) {
    setDecorations([])
    return
  }
  if (
    !vscode.window.activeTextEditor ||
    vscode.window.activeTextEditor.document.version !== document.version
  ) {
    throw new Error('too slow')
  }
  console.log(result)

  if (result.type === 'startAndEndTag') {
    const startTagOffset = result.startTagOffset
    setDecorations([
      [startTagOffset + 1, startTagOffset + result.tagName.length + 1],
    ])
  }
}

export const localPluginHighlightElementMatchingTag: LocalPlugin = async api => {
  api.vscode.window.onDidChangeTextEditorSelection(async event => {
    await askServerForHighlightElementMatchingTag(
      api,
      event.textEditor.document,
      event.selections[0].active
    )
  })
  if (vscode.window.activeTextEditor) {
    await askServerForHighlightElementMatchingTag(
      api,
      vscode.window.activeTextEditor.document,
      vscode.window.activeTextEditor.selection.active
    )
  }
  // api.vscode.workspace.onDidChangeTextDocument
  // api.
}

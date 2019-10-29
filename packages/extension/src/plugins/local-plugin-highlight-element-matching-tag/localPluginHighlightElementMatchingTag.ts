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

const askServerForHighlightElementMatchingTag: (
  api: LocalPluginApi,
  document: vscode.TextDocument,
  position: vscode.Position
) => Promise<Result> = async (api, document, position) => {
  const params = api.languageClient.code2ProtocolConverter.asTextDocumentPositionParams(
    document,
    position
  )
  const result = await api.languageClient.sendRequest(requestType, params)
  if (
    !vscode.window.activeTextEditor ||
    vscode.window.activeTextEditor.document.version !== document.version
  ) {
    throw new Error('too slow')
  }
  return result
}

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

const applyResults = (results: Result[]) => {
  const decorations = results.filter(Boolean).flatMap(result => {
    if (result.type === 'startAndEndTag') {
      const startTagOffset = result.startTagOffset
      // TODO also highlight end tag
      return [
        [startTagOffset + 1, startTagOffset + result.tagName.length + 1],
      ] as [number, number][]
    } else {
      throw new Error(`unknown result type ${result.type}`)
    }
  })
  setDecorations(decorations)
}

export const localPluginHighlightElementMatchingTag: LocalPlugin = async api => {
  api.vscode.window.onDidChangeTextEditorSelection(async event => {
    if (event.textEditor.document.languageId !== 'html') {
      return
    }
    const document = vscode.window.activeTextEditor.document
    const results = await Promise.all(
      event.selections.map(selection =>
        askServerForHighlightElementMatchingTag(api, document, selection.active)
      )
    )
    applyResults(results)
  })
  if (vscode.window.activeTextEditor) {
    const results = await Promise.all(
      vscode.window.activeTextEditor.selections.map(selection =>
        askServerForHighlightElementMatchingTag(
          api,
          vscode.window.activeTextEditor.document,
          selection.active
        )
      )
    )
    applyResults(results)
  }
}

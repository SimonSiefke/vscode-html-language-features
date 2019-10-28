import { LocalPlugin, LocalPluginApi } from '../localPluginApi'
import * as vsl from 'vscode-languageclient'
import * as vscode from 'vscode'

type Result = {
  startOffset: number
  endOffset: number
  word: string
}

const requestType = new vsl.RequestType<
  vsl.TextDocumentPositionParams,
  Result,
  any,
  any
>('html/completion-element-auto-rename-tag')

const askServerForCompletionElementAutoRenameTag: (
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

const applyResult: (result: Result) => void = result => {
  if (!result) {
    return
  }
  const startPosition = vscode.window.activeTextEditor.document.positionAt(
    result.startOffset
  )
  const endPosition = vscode.window.activeTextEditor.document.positionAt(
    result.endOffset
  )
  vscode.window.activeTextEditor.edit(
    editBuilder => {
      editBuilder.replace(
        new vscode.Range(startPosition, endPosition),
        result.word
      )
    },
    {
      undoStopBefore: false,
      undoStopAfter: false,
    }
  )
}

export const localPluginCompletionElementAutoRenameTag: LocalPlugin = api => {
  api.vscode.workspace.onDidChangeTextDocument(async event => {
    const activeDocument =
      vscode.window.activeTextEditor && vscode.window.activeTextEditor.document
    if (event.contentChanges.length === 0) {
      return
    }
    if (event.document !== activeDocument) {
      return
    }
    const lastChange = event.contentChanges[event.contentChanges.length - 1]
    const rangeStart = lastChange.range.start
    const position = new vscode.Position(
      rangeStart.line,
      rangeStart.character + lastChange.text.length
    )
    const result = await askServerForCompletionElementAutoRenameTag(
      api,
      event.document,
      position
    )
    applyResult(result)
  })
}

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

// let i = 0
const askServerForCompletionElementAutoRenameTag: (
  api: LocalPluginApi,
  document: vscode.TextDocument,
  position: vscode.Position
) => Promise<void> = async (api, document, position) => {
  // i++
  const params = api.languageClient.code2ProtocolConverter.asTextDocumentPositionParams(
    document,
    position
  )

  console.log('before request')

  const result = await api.languageClient.sendRequest(requestType, params)
  console.log('after request')
  console.log(result && result.startOffset)
  if (!result) {
    return
  }
  if (
    !vscode.window.activeTextEditor ||
    vscode.window.activeTextEditor.document.version !== document.version
  ) {
    throw new Error('too slow')
  }

  const startPosition = vscode.window.activeTextEditor.document.positionAt(
    result.startOffset
  )
  const endPosition = vscode.window.activeTextEditor.document.positionAt(
    result.endOffset
  )
  // if (i > 100) {
  //   vscode.window.showErrorMessage('endless loop detected')
  //   return
  // }
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
    console.log('rename tag')
    await askServerForCompletionElementAutoRenameTag(
      api,
      event.document,
      position
    )
  })
}

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

const applyResults: (results: Result[]) => Promise<void> = async results => {
  const relevantResults = results.filter(Boolean).map(result => {
    const startPosition = vscode.window.activeTextEditor.document.positionAt(
      result.startOffset
    )
    const endPosition = vscode.window.activeTextEditor.document.positionAt(
      result.endOffset
    )
    return {
      range: new vscode.Range(startPosition, endPosition),
      word: result.word,
    }
  })
  if (relevantResults.length === 0) {
    return
  }
  await vscode.window.activeTextEditor.edit(
    editBuilder => {
      for (const result of relevantResults) {
        editBuilder.replace(result.range, result.word)
      }
    },
    {
      undoStopBefore: false,
      undoStopAfter: false,
    }
  )
}

export const localPluginCompletionElementAutoRenameTag: LocalPlugin = api => {
  api.vscode.workspace.onDidChangeTextDocument(async event => {
    if (event.document.languageId !== 'html') {
      return
    }
    if (
      !vscode.window.activeTextEditor ||
      vscode.window.activeTextEditor.document !== event.document
    ) {
      return
    }
    if (event.contentChanges.length === 0) {
      return
    }
    const positions = event.contentChanges.map(
      ({ range, text }) =>
        new vscode.Position(
          range.start.line,
          range.start.character + text.length
        )
    )
    const results = await Promise.all(
      positions.map(position =>
        askServerForCompletionElementAutoRenameTag(
          api,
          event.document,
          position
        )
      )
    )
    applyResults(results)
  })
}

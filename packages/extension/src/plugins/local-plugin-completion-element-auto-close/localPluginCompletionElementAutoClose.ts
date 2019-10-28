import { LocalPlugin, LocalPluginApi } from '../localPluginApi'
import * as vsl from 'vscode-languageclient'
import * as vscode from 'vscode'

// TODO use optional chaining once prettier works with that

type Result = {
  completionString: string
  completionOffset: number
}

const requestType = new vsl.RequestType<
  vsl.TextDocumentPositionParams,
  Result,
  any,
  any
>('html/completion-element-auto-close')

const askServerForCompletionElementAutoClose: (
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
  vscode.window.activeTextEditor.insertSnippet(
    new vscode.SnippetString(result.completionString)
  )
}

export const localPluginCompletionElementAutoClose: LocalPlugin = api => {
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
    const lastCharacter = lastChange.text[lastChange.text.length - 1]
    if (
      lastChange.rangeLength > 0 ||
      (lastCharacter !== '>' && lastCharacter !== '/')
    ) {
      return
    }
    const rangeStart = lastChange.range.start
    const position = new vscode.Position(
      rangeStart.line,
      rangeStart.character + lastChange.text.length
    )
    if (lastCharacter === '>') {
      const result = await askServerForCompletionElementAutoClose(
        api,
        event.document,
        position
      )
      applyResult(result)
    }
  })
}

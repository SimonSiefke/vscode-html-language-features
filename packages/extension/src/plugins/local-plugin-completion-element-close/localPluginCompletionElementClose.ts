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
>('html/completion-element-close')

const askServerForCompletionElementClose: (
  api: LocalPluginApi,
  document: vscode.TextDocument,
  position: vscode.Position
) => Promise<Result> = async (api, document, position) => {
  const params = api.languageClient.code2ProtocolConverter.asTextDocumentPositionParams(
    document,
    position
  )
  const result = await api.languageClient.sendRequest(requestType, params)
  // TODO duplicate code below
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

export const localPluginCompletionElementClose: LocalPlugin = api => {
  api.vscode.workspace.onDidChangeTextDocument(async event => {
    if (event.document.languageId !== 'html') {
      return
    }
    const activeDocument =
      vscode.window.activeTextEditor && vscode.window.activeTextEditor.document
    if (
      event.document !== activeDocument ||
      event.contentChanges.length === 0
    ) {
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
    if (lastCharacter === '/') {
      const secondToLastCharacter = event.document.getText(
        new vscode.Range(
          new vscode.Position(
            rangeStart.line,
            rangeStart.character + lastChange.text.length - 2
          ),
          new vscode.Position(
            rangeStart.line,
            rangeStart.character + lastChange.text.length - 1
          )
        )
      )
      if (secondToLastCharacter === '<') {
        const result = await askServerForCompletionElementClose(
          api,
          event.document,
          position
        )
        applyResult(result)
      }
    }
  })
}

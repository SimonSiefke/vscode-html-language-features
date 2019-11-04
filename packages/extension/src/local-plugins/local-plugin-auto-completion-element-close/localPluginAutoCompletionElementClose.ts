import * as vscode from 'vscode'
import { LocalPluginApi } from '../../local-plugin-api/localPluginApi'
import { LocalPlugin } from '../localPlugin'
import { RequestType, TextDocumentPositionParams } from 'vscode-languageclient'

// TODO use optional chaining once prettier works with that

type Result = {
  completionString: string
  completionOffset: number
}

const requestType = new RequestType<
  TextDocumentPositionParams,
  Result,
  any,
  any
>('html/auto-completion-element-close')

const askServerForAutoCompletionElementClose: (
  api: LocalPluginApi,
  document: vscode.TextDocument,
  position: vscode.Position
) => Promise<Result> = async (api, document, position) => {
  const params = api.languageClientProxy.code2ProtocolConverter.asTextDocumentPositionParams(
    document,
    position
  )
  const result = await api.languageClientProxy.sendRequest(requestType, params)
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

export const localPluginAutoCompletionElementClose: LocalPlugin = api => {
  api.vscodeProxy.workspace.onDidChangeTextDocument(async event => {
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
        const result = await askServerForAutoCompletionElementClose(
          api,
          event.document,
          position
        )
        applyResult(result)
      }
    }
  })
}

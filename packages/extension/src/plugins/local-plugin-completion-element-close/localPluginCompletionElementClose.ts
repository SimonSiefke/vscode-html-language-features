import { LocalPlugin, LocalPluginApi } from '../localPluginApi'
import * as vsl from 'vscode-languageclient'
import * as vscode from 'vscode'

// TODO use optional chaining once prettier works with that

type Result = {
  completionString: string
  completionOffset: number
}

const askServerForCompletionElementClose: (
  api: LocalPluginApi,
  document: vscode.TextDocument,
  position: vscode.Position
) => Promise<void> = async (api, document, position) => {
  console.log('ask server')
  const params = api.languageClient.code2ProtocolConverter.asTextDocumentPositionParams(
    document,
    position
  )
  const requestType = new vsl.RequestType<
    vsl.TextDocumentPositionParams,
    Result,
    any,
    any
  >('html/end-tag-close')
  const result = await api.languageClient.sendRequest(requestType, params)
  if (!result) {
    return
  }
  if (
    !api.vscode.window.activeTextEditor ||
    api.vscode.window.activeTextEditor.document.version !== document.version
  ) {
    throw new Error('too slow')
  }
  api.vscode.window.activeTextEditor.insertSnippet(
    new api.vscode.SnippetString(result.completionString)
  )
}

export const localPluginCompletionElementClose: LocalPlugin = api => {
  api.vscode.workspace.onDidChangeTextDocument(async event => {
    const activeDocument =
      api.vscode.window.activeTextEditor &&
      api.vscode.window.activeTextEditor.document
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
    const position = new api.vscode.Position(
      rangeStart.line,
      rangeStart.character + lastChange.text.length
    )
    if (lastCharacter === '/') {
      const secondToLastCharacter = event.document.getText(
        new api.vscode.Range(
          new api.vscode.Position(
            rangeStart.line,
            rangeStart.character + lastChange.text.length - 2
          ),
          new api.vscode.Position(
            rangeStart.line,
            rangeStart.character + lastChange.text.length - 1
          )
        )
      )
      if (secondToLastCharacter === '<') {
        await askServerForCompletionElementClose(api, event.document, position)
      }
    }
  })
}

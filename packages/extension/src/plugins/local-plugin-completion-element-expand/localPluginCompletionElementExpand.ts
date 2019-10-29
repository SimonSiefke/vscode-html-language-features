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
>('html/completion-element-expand')

const askServerForCompletionElementExpand: (
  api: LocalPluginApi,
  document: vscode.TextDocument,
  position: vscode.Position
) => Promise<Result> = async (api, document, position) => {
  const params = api.languageClient.code2ProtocolConverter.asTextDocumentPositionParams(
    document,
    position
  )
  const result = await api.languageClient.sendRequest(requestType, params)
  // TODO duplicate code
  if (
    !vscode.window.activeTextEditor ||
    vscode.window.activeTextEditor.document.version !== document.version
  ) {
    console.log(document.uri.fsPath)
    console.log(vscode.window.activeTextEditor.document.uri.fsPath)
    throw new Error('too slow')
  }
  return result
}

const applyResult: (
  api: LocalPluginApi,
  document: vscode.TextDocument,
  position: vscode.Position,
  result: Result
) => Promise<void> = async (api, document, position, result) => {
  if (!result) {
    await vscode.commands.executeCommand('tab')
    return
  }
  const { completionString, completionOffset } = result
  const completionPosition = document.positionAt(completionOffset)
  vscode.window.activeTextEditor.insertSnippet(
    new vscode.SnippetString(completionString),
    new vscode.Range(completionPosition, position)
  )
}

export const localPluginCompletionElementExpand: LocalPlugin = api => {
  api.vscode.commands.registerTextEditorCommand(
    'html-expand-abbreviation',
    async textEditor => {
      const document = textEditor.document
      const position = textEditor.selection.active
      // const rangeUntilPosition = new vscode.Range(
      //   new vscode.Position(position.line, 0),
      //   position
      // )
      // const textUntilPosition = textEditor.document.getText(
      //   rangeUntilPosition
      // )
      const result = await askServerForCompletionElementExpand(
        api,
        document,
        position
      )
      await applyResult(api, document, position, result)
    }
  )

  // console.log('em')

  //     try {
  //       const extracted = extractAbbreviation(
  //         textUntilPosition,
  //         position.character
  //       )
  //       if (!extracted) {
  //         return
  //       }
  //       const { abbreviation } = extracted
  //       const expanded = expand(abbreviation, {
  //         syntax: 'html',
  //         field(index, placeholder) {
  //           return `\${${index}${placeholder ? `:${placeholder}` : ''}}`
  //         },
  //       })
  //       textEditor.insertSnippet(
  //         new vscode.SnippetString(expanded),
  //         new vscode.Range(
  //           new vscode.Position(
  //             position.line,
  //             position.character - abbreviation.length
  //           ),
  //           position
  //         )
  //       )
  //     } catch (error) {
  //       console.error(error)
  //     }
  //   }
  // )
}

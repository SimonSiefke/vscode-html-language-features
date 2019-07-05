import * as vscode from 'vscode'
import * as vsl from 'vscode-languageclient'
import { DoCompletion } from './htmlClosingTagCompletionService'

const autoRenameTagRequest = new vsl.RequestType<
  vsl.TextDocumentPositionParams,
  { startOffset: number; endOffset: number; word: string },
  any,
  any
>('html/auto-rename-tag')

const requestAutoRenameTag = async (
  client: vsl.LanguageClient,
  document: vscode.TextDocument,
  position: vscode.Position
): Promise<
  | {
      startOffset: number
      endOffset: number
      word: string
    }
  | undefined
> => {
  const params = client.code2ProtocolConverter.asTextDocumentPositionParams(
    document,
    position
  )
  // ask the server for the completion
  const result = await client.sendRequest(autoRenameTagRequest, params)
  if (!result) {
    // console.error('no completion')
    // await vscode.commands.executeCommand('tab')
    return undefined
  }
  if (
    !vscode.window.activeTextEditor ||
    vscode.window.activeTextEditor.document.version !== document.version
  ) {
    throw new Error('too slow')
  }
  return result
}

export function activate(
  context: vscode.ExtensionContext,
  languageClient: vsl.LanguageClient
): void {
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(async event => {
      if (event.document.languageId !== 'html') {
        return
      }
      if (event.contentChanges.length === 0) {
        return
      }
      if (event.contentChanges.length !== 1) {
        return
      }
      if (event.document !== vscode.window.activeTextEditor.document) {
        console.error('what')
        return
      }
      const document = event.document
      let cursorPosition = vscode.window.activeTextEditor.selection.active
      const rangeStart = event.contentChanges[0].range.start
      const rangeEnd = event.contentChanges[0].range.end
      if (rangeStart.isBefore(rangeEnd)) {
        cursorPosition = rangeStart
      } else {
        cursorPosition = document.positionAt(
          document.offsetAt(cursorPosition) +
            event.contentChanges[0].text.length
        )
      }
      const result = await requestAutoRenameTag(
        languageClient,
        document,
        cursorPosition
      )
      if (!result) {
        return
      }
      const startPosition = document.positionAt(result.startOffset)
      const endPosition = document.positionAt(result.endOffset)
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
    })
  )
}

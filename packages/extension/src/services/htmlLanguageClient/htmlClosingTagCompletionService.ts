import * as vscode from 'vscode'
import {
  LanguageClient,
  RequestType,
  TextDocumentPositionParams,
} from 'vscode-languageclient'
import { Service } from '../../types'

type DoCompletion<T = any> = (
  client: LanguageClient,
  document: vscode.TextDocument,
  position: vscode.Position
) => Promise<T>

const createDoCompletion: (
  requestType: RequestType<TextDocumentPositionParams, string, any, any>
) => DoCompletion = requestType => async (client, document, position) => {
  const params = client.code2ProtocolConverter.asTextDocumentPositionParams(
    document,
    position
  )
  // ask the server for the completion
  const autoCompletionString = await client.sendRequest(requestType, params)
  if (!autoCompletionString) {
    return
  }
  if (
    !vscode.window.activeTextEditor ||
    vscode.window.activeTextEditor.document.version !== document.version
  ) {
    throw new Error('too slow')
  }
  vscode.window.activeTextEditor.insertSnippet(
    new vscode.SnippetString(autoCompletionString)
  )
}

const createDoAutoRenameTagCompletion: (
  requestType: RequestType<
    TextDocumentPositionParams,
    { startOffset: number; endOffset: number; word: string },
    any,
    any
  >
) => DoCompletion<
  | {
      startOffset: number
      endOffset: number
      word: string
    }
  | undefined
> = requestType => async (client, document, position) => {
  const params = client.code2ProtocolConverter.asTextDocumentPositionParams(
    document,
    position
  )
  // ask the server for the completion
  const result = await client.sendRequest(requestType, params)
  if (!result) {
    // console.error('no completion')
    // await vscode.commands.executeCommand('tab')
    return
  }
  if (
    !vscode.window.activeTextEditor ||
    vscode.window.activeTextEditor.document.version !== document.version
  ) {
    throw new Error('too slow')
  }
  return result
  // const { startOffset, endOffset, word } = result
  // const startPosition = document.positionAt(startOffset)
  // const endPosition = document.positionAt(endOffset)
  // vscode.window.activeTextEditor.insertSnippet(
  //   new vscode.SnippetString(completionString),
  //   new vscode.Range(completionPosition, position),
  //   {
  //     undoStopAfter: false,
  //     undoStopBefore: false,
  //   }
  // )
}

export const doAutoRenameTagCompletion = createDoAutoRenameTagCompletion(
  new RequestType('html/auto-rename-tag')
)

const createDoEmmetCompletion: (
  requestType: RequestType<
    TextDocumentPositionParams,
    { completionString: string; completionOffset: number },
    any,
    any
  >
) => DoCompletion = requestType => async (client, document, position) => {
  const params = client.code2ProtocolConverter.asTextDocumentPositionParams(
    document,
    position
  )
  // ask the server for the completion
  const result = await client.sendRequest(requestType, params)
  if (!result) {
    // console.error('no completion')
    await vscode.commands.executeCommand('tab')
    return
  }
  if (
    !vscode.window.activeTextEditor ||
    vscode.window.activeTextEditor.document.version !== document.version
  ) {
    throw new Error('too slow')
  }
  const { completionString, completionOffset } = result
  const completionPosition = document.positionAt(completionOffset)
  vscode.window.activeTextEditor.insertSnippet(
    new vscode.SnippetString(completionString),
    new vscode.Range(completionPosition, position),
    {
      undoStopAfter: false,
      undoStopBefore: false,
    }
  )
}
/**
 * End tag close completion
 *`<p>this is text</` -> `<p>this is text</p>`.
 */
const doEndTagCloseCompletion: DoCompletion = createDoCompletion(
  new RequestType('html/end-tag-close')
)

export const doEmmetTagCompletion: DoCompletion = createDoEmmetCompletion(
  new RequestType('html/emmet-tag-completion')
)

/**
 * End tag auto close completion.
 * `<div>` -> `<div></div>`.
 */
const doEndTagAutoCloseCompletion: DoCompletion = createDoCompletion(
  new RequestType('html/end-tag-auto-close')
)

/**
 * Self closing tag close completion
 * `<div/` -> `<div/>`.
 */
const doSelfClosingTagCloseCompletion: DoCompletion = createDoCompletion(
  new RequestType('html/end-tag-auto-close')
)

function activate(
  context: vscode.ExtensionContext,
  client: LanguageClient
): void {
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(
      async ({ contentChanges: changes, document }) => {
        const activeDocument =
          vscode.window.activeTextEditor &&
          vscode.window.activeTextEditor.document
        if (document !== activeDocument || changes.length === 0) {
          return
        }
        const lastChange = changes[changes.length - 1]
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
        let completion: DoCompletion
        if (lastCharacter === '>') {
          await doEndTagAutoCloseCompletion(client, document, position)
        } else if (lastCharacter === '/') {
          const secondToLastCharacter = document.getText(
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
            await doEndTagCloseCompletion(client, document, position)
          }
        }
      }
    )
  )
}

export const htmlClosingTagCompletionService: Service<LanguageClient> = {
  activate,
}

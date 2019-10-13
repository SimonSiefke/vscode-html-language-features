import * as vscode from 'vscode'
import * as vsl from 'vscode-languageclient'
import { LanguageClient } from 'vscode-languageclient'

export type DoCompletion<T = any> = (
  client: vsl.LanguageClient,
  document: vscode.TextDocument,
  position: vscode.Position
) => Promise<T>

export const createDoCompletion: (
  requestType: vsl.RequestType<vsl.TextDocumentPositionParams, string, any, any>
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

/**
 * End tag close completion
 *`<p>this is text</` -> `<p>this is text</p>`.
 */
const doEndTagCloseCompletion: DoCompletion = createDoCompletion(
  new vsl.RequestType('html/end-tag-close')
)



/**
 * End tag auto close completion.
 * `<div>` -> `<div></div>`.
 */
const doEndTagAutoCloseCompletion: DoCompletion = createDoCompletion(
  new vsl.RequestType('html/end-tag-auto-close')
)

/**
 * Self closing tag close completion
 * `<div/` -> `<div/>`.
 */
const doSelfClosingTagCloseCompletion: DoCompletion = createDoCompletion(
  new vsl.RequestType('html/end-tag-auto-close')
)

export function activate(
  context: vscode.ExtensionContext,
  languageClientPromise: Promise<LanguageClient>
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
          const languageClient = await languageClientPromise
          await doEndTagAutoCloseCompletion(languageClient, document, position)
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
            const languageClient = await languageClientPromise
            await doEndTagCloseCompletion(languageClient, document, position)
          }
        }
      }
    )
  )
}

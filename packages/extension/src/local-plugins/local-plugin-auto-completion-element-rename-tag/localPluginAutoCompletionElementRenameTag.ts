import * as vscode from 'vscode'
import { doAutoCompletionElementRenameTag } from '@html-language-features/html-language-service'
import { LocalPlugin } from '../localPlugin'

type Result = {
  startOffset: number
  endOffset: number
  word: string
}

// TODO
// its necessary to have on the client

// const requestType = new vsl.RequestType<
//   vsl.TextDocumentPositionParams,
//   Result,
//   any,
//   any
// >('html/completion-element-auto-rename-tag')

// const askServerForCompletionElementAutoRenameTag: (
//   api: LocalPluginApi,
//   document: vscode.TextDocument,
//   position: vscode.Position,
//   cancellationToken: vscode.CancellationToken
// ) => Promise<Result | undefined> = async (
//   api,
//   document,
//   position,
//   cancellationToken
// ) => {
//   const params = api.languageClient.code2ProtocolConverter.asTextDocumentPositionParams(
//     document,
//     position
//   )
//   const result = await api.languageClient.sendRequest(
//     requestType,
//     params,
//     cancellationToken
//   )
//   if (
//     !vscode.window.activeTextEditor ||
//     vscode.window.activeTextEditor.document.version !== document.version
//   ) {
//     throw new Error('too slow')
//   }
//   return result
// }

const askServiceForAutoCompletionElementRenameTag: (
  document: vscode.TextDocument,
  position: vscode.Position
) => Result | undefined = (document, position) => {
  const text = document.getText()
  const offset = document.offsetAt(position)
  return doAutoCompletionElementRenameTag(text, offset)
}

/**
 * Utility variable that stores the last changed version (document.uri.fsPath and document.version)
 * When a change was caused by auto-rename-tag, we can ignore that change, which is a simple performance improvement. One thing to take care of is undo, but that works now (and there are test cases).
 */
let lastChangeByAutoRenameTag: { fsPath: string; version: number } = {
  fsPath: '',
  version: -1,
}

const applyResults: (
  results: (Result | undefined)[]
) => Promise<void> = async results => {
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
  lastChangeByAutoRenameTag = {
    fsPath: vscode.window.activeTextEditor.document.uri.fsPath,
    version: vscode.window.activeTextEditor.document.version,
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

export const localPluginAutoCompletionElementRenameTag: LocalPlugin = api => {
  api.vscodeProxy.workspace.onDidChangeTextDocument(async event => {
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
    if (
      lastChangeByAutoRenameTag.fsPath === event.document.uri.fsPath &&
      lastChangeByAutoRenameTag.version + 1 === event.document.version
    ) {
      return
    }
    const positions = event.contentChanges.map(
      ({ range, text }) =>
        new vscode.Position(
          range.start.line,
          range.start.character + text.length
        )
    )
    const results = positions.map(position =>
      askServiceForAutoCompletionElementRenameTag(event.document, position)
    )
    api.autoRenameTagPromise = new Promise(async (resolve, reject) => {
      try {
        await applyResults(results)
      } catch (error) {
        reject(error)
      }
      api.autoRenameTagPromise = undefined
      resolve()
    })
  })
}

import * as vscode from 'vscode'
import { expand } from '@emmetio/expand-abbreviation'
import * as extractAbbreviation from '@emmetio/extract-abbreviation'
import { Service } from '../../types'
import {
  LanguageClient,
  RequestType,
  TextDocumentPositionParams,
} from 'vscode-languageclient'
import {
  doEmmetTagCompletion,
  doAutoRenameTagCompletion,
} from './htmlClosingTagCompletionService'

function activate(
  context: vscode.ExtensionContext,
  client: LanguageClient
): void {
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      'emmet-expand-abbreviation',
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
        await doEmmetTagCompletion(client, document, position)
      }
    )
  )
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
      const result = await doAutoRenameTagCompletion(
        client,
        document,
        cursorPosition
      )
      if (!result) {
        return
      }
      const startPosition = document.positionAt(result.startOffset)
      const endPosition = document.positionAt(result.endOffset)
      console.log('completion inserted')
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

export const emmetService: Service<LanguageClient> = { activate }

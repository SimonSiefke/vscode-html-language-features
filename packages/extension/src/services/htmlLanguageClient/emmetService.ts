import * as vscode from 'vscode'
import { expand } from '@emmetio/expand-abbreviation'
import * as extractAbbreviation from '@emmetio/extract-abbreviation'
import { Service } from '../../types'
import {
  LanguageClient,
  RequestType,
  TextDocumentPositionParams,
} from 'vscode-languageclient'
import { doEmmetTagCompletion } from './htmlClosingTagCompletionService'

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

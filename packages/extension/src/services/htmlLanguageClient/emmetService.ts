import * as vscode from 'vscode'
import { LanguageClient } from 'vscode-languageclient'
import { doEmmetTagCompletion } from './htmlClosingTagCompletionService'

export function activate(
  context: vscode.ExtensionContext,
  languageClientPromise: Promise<LanguageClient>
): void {
  console.log('em')
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      'html-expand-abbreviation',
      async textEditor => {
        const languageClient = await languageClientPromise
        const document = textEditor.document
        const position = textEditor.selection.active
        // const rangeUntilPosition = new vscode.Range(
        //   new vscode.Position(position.line, 0),
        //   position
        // )
        // const textUntilPosition = textEditor.document.getText(
        //   rangeUntilPosition
        // )
        await doEmmetTagCompletion(languageClient, document, position)
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

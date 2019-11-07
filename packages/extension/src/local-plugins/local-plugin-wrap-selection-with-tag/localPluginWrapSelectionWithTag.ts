import * as vscode from 'vscode'
import { LocalPlugin } from '../localPlugin'

export const localPluginWrapSelectionWithTag: LocalPlugin = api => {
  api.vscodeProxy.commands.registerTextEditorCommand(
    'html.wrap-selection-with-tag',
    async textEditor => {
      const selectedText = textEditor.document.getText(textEditor.selection)
      await textEditor.insertSnippet(
        new vscode.SnippetString(
          `<\${0:div}>\n\t${`${selectedText}`}\n</\${0:div}>`
        )
      )
    }
  )
}

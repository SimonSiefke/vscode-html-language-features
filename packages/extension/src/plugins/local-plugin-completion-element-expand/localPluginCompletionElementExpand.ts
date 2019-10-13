import { LocalPlugin, LocalPluginApi } from '../localPluginApi'
import * as vsl from 'vscode-languageclient'

// TODO use optional chaining once prettier works with that

const askServerForCompletionElementExpand: (
  api: LocalPluginApi,
  { document, position }: { document: any; position: any }
) => Promise<void> = async (api, { document, position }) => {
  const params = api.languageClient.code2ProtocolConverter.asTextDocumentPositionParams(
    document,
    position
  )
  const requestType = new vsl.RequestType<
    vsl.TextDocumentPositionParams,
    { completionString: string; completionOffset: number },
    any,
    any
  >('html/emmet-tag-completion')
  const result = await api.languageClient.sendRequest(requestType, params)
  if (!result) {
    console.error('no completion')
    await api.vscode.commands.executeCommand('tab')
    return
  }
  if (
    !api.vscode.window.activeTextEditor ||
    api.vscode.window.activeTextEditor.document.version !== document.version
  ) {
    throw new Error('too slow')
  }
  const { completionString, completionOffset } = result
  console.log('compl' + completionString)
  console.log('complo' + completionOffset)
  const completionPosition = document.positionAt(completionOffset)
  api.vscode.window.activeTextEditor.insertSnippet(
    new api.vscode.SnippetString(completionString),
    new api.vscode.Range(completionPosition, position),
    {
      undoStopAfter: false,
      undoStopBefore: false,
    }
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
      await askServerForCompletionElementExpand(api, {
        document,
        position,
      })
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

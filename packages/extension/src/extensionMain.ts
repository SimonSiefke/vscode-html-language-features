import * as vscode from 'vscode'
import { htmlLanguageConfigurationService } from './services/htmlLanguageConfiguration/htmlLanguageConfigurationService'
import {
  htmlLanguageClientService,
  createLanguageClient,
} from './services/htmlLanguageClient/htmlLanguageClientService'
import { emmetService } from './services/htmlLanguageClient/emmetService'
import { htmlClosingTagCompletionService } from './services/htmlLanguageClient/htmlClosingTagCompletionService'

const fakeEmmetService = {
  activate(context) {
    context.subscriptions.push(
      vscode.commands.registerTextEditorCommand(
        'emmet-expand-abbreviation',
        () => {
          return vscode.commands.executeCommand('tab')
        }
      )
    )
  },
}
export async function activate(context: vscode.ExtensionContext) {
  const languageClient = await createLanguageClient(context)
  htmlLanguageConfigurationService.activate(context)
  fakeEmmetService.activate(context)
  // emmetService.activate(context, languageClient)
  htmlClosingTagCompletionService.activate(context, languageClient)
  // htmlLanguageClientService.activate(context)
}

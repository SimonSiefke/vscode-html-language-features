import * as vscode from 'vscode'
import { htmlLanguageConfigurationService } from './services/htmlLanguageConfiguration/htmlLanguageConfigurationService'
import {
  htmlLanguageClientService,
  createLanguageClient,
} from './services/htmlLanguageClient/htmlLanguageClientService'
import { emmetService } from './services/htmlLanguageClient/emmetService'
import { htmlClosingTagCompletionService } from './services/htmlLanguageClient/htmlClosingTagCompletionService'
import * as autoRenameTagService from './services/htmlLanguageClient/autoRenameTagService'

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
  // fakeEmmetService.activate(context)
  emmetService.activate(context, languageClient)
  // autoRenameTagService.activate(context, languageClient)
  htmlClosingTagCompletionService.activate(context, languageClient)
  // htmlLanguageClientService.activate(context)

  vscode.commands.registerCommand('extension.sayHello', async () => {
    if (!vscode.window.activeTextEditor) {
      return
    }

    const inset = vscode.window.createWebviewTextEditorInset(
      vscode.window.activeTextEditor,
      0,
      10
    )
    inset.onDidDispose(() => {
      console.log('WEBVIEW disposed...')
    })
    inset.webview.html = `<head><meta></head><body><button style="display:block">click me</button><input type="number"><img src="https://imgs.xkcd.com/comics/plutonium.png"/><body>`
  })
}

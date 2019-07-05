import * as vscode from 'vscode'
import * as htmlLanguageConfigurationService from './services/htmlLanguageConfiguration/htmlLanguageConfigurationService'
import { createLanguageClient } from './services/htmlLanguageClient/htmlLanguageClientService'
import * as emmetService from './services/htmlLanguageClient/emmetService'
// import { htmlClosingTagCompletionService } from './services/htmlLanguageClient/htmlClosingTagCompletionService'
// import * as autoRenameTagService from './services/htmlLanguageClient/autoRenameTagService'

export async function activate(context: vscode.ExtensionContext) {
  const languageClientPromise = createLanguageClient(context)
  emmetService.activate(context, languageClientPromise)
  htmlLanguageConfigurationService.activate(context)
  // autoRenameTagService.activate(context, languageClient)
  // htmlClosingTagCompletionService.activate(context, languageClient)
}

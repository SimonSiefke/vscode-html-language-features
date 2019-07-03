import * as vscode from 'vscode'
import { htmlLanguageConfigurationService } from './services/htmlLanguageConfiguration/htmlLanguageConfigurationService'
import {
  htmlLanguageClientService,
  createLanguageClient,
} from './services/htmlLanguageClient/htmlLanguageClientService'
import { emmetService } from './services/htmlLanguageClient/emmetService'
import { htmlClosingTagCompletionService } from './services/htmlLanguageClient/htmlClosingTagCompletionService'

export async function activate(context: vscode.ExtensionContext) {
  const languageClient = await createLanguageClient(context)
  htmlLanguageConfigurationService.activate(context)
  emmetService.activate(context, languageClient)
  htmlClosingTagCompletionService.activate(context, languageClient)
  // htmlLanguageClientService.activate(context)
}

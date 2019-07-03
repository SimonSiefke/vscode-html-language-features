import * as vscode from 'vscode'

export interface Service<Options = undefined> {
  activate: Options extends undefined
    ? (context: vscode.ExtensionContext) => void
    : ((context: vscode.ExtensionContext, options: Options) => void)
}

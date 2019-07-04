import * as vscode from 'vscode'

const extension = vscode.extensions.getExtension('SimonSiefke.extension')

export async function activateExtension() {
  await extension.activate()
}

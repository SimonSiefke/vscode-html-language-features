import * as vscode from 'vscode'
import * as vsl from 'vscode-languageclient'
import { RequestType, CancellationToken } from 'vscode-languageclient'

type AutoDispose<Fn extends (...args: any) => vscode.Disposable> = (
  ...args: Parameters<Fn>
) => void

type VslSendRequest = <P, R, E, RO>(
  type: RequestType<P, R, E, RO>,
  params: P,
  token?: CancellationToken
) => Thenable<R>

export type LocalPluginApi = Readonly<{
  vscode: {
    commands: {
      registerTextEditorCommand: AutoDispose<
        typeof vscode.commands.registerTextEditorCommand
      >
    }
    workspace: {
      onDidChangeTextDocument: AutoDispose<
        typeof vscode.workspace.onDidChangeTextDocument
      >
    }
    window: {
      onDidChangeTextEditorSelection: AutoDispose<
        typeof vscode.window.onDidChangeTextEditorSelection
      >
    }
  }
  languageClient: {
    code2ProtocolConverter: vsl.Code2ProtocolConverter
    sendRequest: VslSendRequest
  }
}>

export type LocalPlugin = (api: LocalPluginApi) => void

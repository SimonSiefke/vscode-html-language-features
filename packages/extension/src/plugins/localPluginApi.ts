import * as vscode from 'vscode'
import * as vsl from 'vscode-languageclient'
import {
  RequestType0,
  RequestType,
  CancellationToken,
} from 'vscode-languageclient'

type AutoDispose<T> = T

type VslSendRequest = <P, R, E, RO>(
  type: RequestType<P, R, E, RO>,
  params: P,
  token?: CancellationToken
) => Thenable<R>

export interface LocalPluginApi {
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
}

export type LocalPlugin = (api: LocalPluginApi) => void

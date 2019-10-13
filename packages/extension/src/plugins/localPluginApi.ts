import * as vscode from 'vscode'
import * as vsl from 'vscode-languageclient'
import {
  RequestType0,
  RequestType,
  CancellationToken,
} from 'vscode-languageclient'

type AutoDispose<T> = T

type VslSendRequest = (<R, E, RO>(
  type: RequestType0<R, E, RO>,
  token?: vscode.CancellationToken
) => Thenable<R>) &
  (<P, R, E, RO>(
    type: RequestType<P, R, E, RO>,
    params: P,
    token?: CancellationToken
  ) => Thenable<R>) &
  (<R>(method: string, token?: CancellationToken) => Thenable<R>) &
  (<R>(method: string, param: any, token?: CancellationToken) => Thenable<R>)

export interface LocalPluginApi {
  vscode: {
    SnippetString: typeof vscode.SnippetString
    Range: typeof vscode.Range
    Position: typeof vscode.Position
    commands: {
      executeCommand: typeof vscode.commands.executeCommand
      registerTextEditorCommand: AutoDispose<
        typeof vscode.commands.registerTextEditorCommand
      >
    }
    window: {
      activeTextEditor: vscode.TextEditor
    }
    workspace: {
      onDidChangeTextDocument: AutoDispose<
        typeof vscode.workspace.onDidChangeTextDocument
      >
    }
  }
  languageClient: {
    code2ProtocolConverter: vsl.Code2ProtocolConverter
    sendRequest: VslSendRequest
  }
}

export type LocalPlugin = (api: LocalPluginApi) => void

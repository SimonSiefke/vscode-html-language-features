import * as vsl from 'vscode-languageclient'
import * as vscode from 'vscode'
import { LocalPlugin, LocalPluginApi } from '../plugins/localPluginApi'

const clientOptions: vsl.LanguageClientOptions = {
  documentSelector: [
    {
      language: 'html',
      scheme: 'file',
    },
  ],
}

export const createLanguageClient = async (
  context: vscode.ExtensionContext
): Promise<{ registerLocalPlugin: (plugin: LocalPlugin) => void }> => {
  const serverModule = context.asAbsolutePath(
    '../html-language-server/dist/htmlLanguageServerMain.js'
  )
  // If the extension is launch in debug mode the debug server options are use
  // Otherwise the run options are used
  const serverOptions: vsl.ServerOptions = {
    run: { module: serverModule, transport: vsl.TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: vsl.TransportKind.ipc,
      options: { execArgv: ['--nolazy', '--inspect=6009'] },
    },
  }

  // // // // // // // // \\ \\ \\ \\ \\ \\ \\
  // // // // //                \\ \\ \\ \\ \\
  // // // //                      \\ \\ \\ \\
  // // //        Begin Debug         \\ \\ \\
  // //                                  \\ \\
  //                                        \\
  if (true) {
    const streamLogs = true
    if (streamLogs) {
      // eslint-disable-next-line global-require

      const WebSocket = require('ws')
      let socket: import('ws') | undefined

      context.subscriptions.push(
        vscode.commands.registerCommand(
          'htmlLanguageClient.startStreaming',
          () => {
            // Establish websocket connection
            socket = new WebSocket('ws://localhost:7000')
          }
        )
      )

      // The log to send
      let log = ''
      const websocketOutputChannel: vscode.OutputChannel = {
        name: 'websocket',
        // Only append the logs but send them later
        append(value: string) {
          log += value
        },
        appendLine(value: string) {
          try {
            JSON.parse(value)
          } catch (error) {
            if (typeof value !== 'object') {
              console.log(value)
            }
          }
          log += value
          // Don't send logs until WebSocket initialization
          if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(log)
          }
          log = ''
        },
        clear() {},
        show() {},
        hide() {},
        dispose() {},
      }
      clientOptions.outputChannel = websocketOutputChannel
    } else {
      const consoleChannel: vscode.OutputChannel = {
        name: 'websocket',
        append() {},
        appendLine(value: string) {
          try {
            JSON.parse(value)
          } catch (error) {
            if (typeof value !== 'object') {
              console.log(value)
            }
          }
        },
        clear() {},
        show() {},
        hide() {},
        dispose() {},
      }
      clientOptions.outputChannel = consoleChannel
      // clientOptions.outputChannel = vscode.window.createOutputChannel(
      //   'htmlLanguageClient'
      // )
    }
  }
  //                                        \\
  // //                                  \\ \\
  // // //          End Debug         \\ \\ \\
  // // // //                      \\ \\ \\ \\
  // // // // //                \\ \\ \\ \\ \\
  // // // // // // // // \\ \\ \\ \\ \\ \\ \\

  const languageClient = new vsl.LanguageClient(
    'htmlLanguageClient',
    'HTML Language Client',
    serverOptions,
    clientOptions
  )
  context.subscriptions.push(languageClient.start())
  await languageClient.onReady()

  const autoDispose = fn => fn
  const api: LocalPluginApi = {
    vscode: {
      SnippetString: vscode.SnippetString,
      Range: vscode.Range,
      Position: vscode.Position,
      window: {
        activeTextEditor: vscode.window.activeTextEditor,
      },
      workspace: {
        onDidChangeTextDocument: autoDispose(
          vscode.workspace.onDidChangeTextDocument
        ),
      },
      commands: {
        executeCommand: vscode.commands.executeCommand,
        registerTextEditorCommand: autoDispose(
          vscode.commands.registerTextEditorCommand
        ),
      },
    },
    languageClient,
  }
  return {
    registerLocalPlugin: plugin => {
      plugin(api)
    },
  }
}

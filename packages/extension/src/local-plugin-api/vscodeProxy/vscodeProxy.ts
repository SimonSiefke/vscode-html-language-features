import * as vscode from 'vscode'

type AutoDispose<Fn extends (...args: any) => vscode.Disposable> = (
  ...args: Parameters<Fn>
) => void

export interface VscodeProxy {
  extensions: {
    onDidChange: AutoDispose<typeof vscode.extensions['onDidChange']>
  }
  commands: {
    registerTextEditorCommand: AutoDispose<
      typeof vscode.commands.registerTextEditorCommand
    >
  }
  languages: {
    setLanguageConfiguration: AutoDispose<
      typeof vscode.languages.setLanguageConfiguration
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

export const createVscodeProxy: (
  context: vscode.ExtensionContext
) => VscodeProxy = context => {
  const autoDispose: <Fn extends (...args: any[]) => vscode.Disposable>(
    fn: Fn
  ) => (...args: Parameters<Fn>) => void = fn => (...args) => {
    context.subscriptions.push(fn(...args))
  }
  return {
    extensions: {
      onDidChange: autoDispose(vscode.extensions.onDidChange),
    },
    languages: {
      setLanguageConfiguration: autoDispose(
        vscode.languages.setLanguageConfiguration
      ),
    },
    window: {
      onDidChangeTextEditorSelection: autoDispose(
        vscode.window.onDidChangeTextEditorSelection
      ),
    },
    workspace: {
      onDidChangeTextDocument: autoDispose(
        vscode.workspace.onDidChangeTextDocument
      ),
    },
    commands: {
      registerTextEditorCommand: autoDispose(
        vscode.commands.registerTextEditorCommand
      ),
    },
  }
}

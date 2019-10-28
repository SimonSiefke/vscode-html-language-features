import * as vscode from 'vscode'

let timeout: NodeJS.Timer | undefined

const smallNumberDecorationType = vscode.window.createTextEditorDecorationType({
  borderWidth: '0 0 1px 0',
  borderStyle: 'solid',
  borderColor: 'yellow',
})

let activeEditor = vscode.window.activeTextEditor

function updateDecorations() {
  if (!activeEditor) {
    return
  }
  const startOffset = activeEditor.document.offsetAt(
    vscode.window.activeTextEditor.selection.active
  )
  console.log(startOffset)
  const startPosition = activeEditor.document.positionAt(startOffset)
  const endPosition = activeEditor.document.positionAt(startOffset + 2)
  const decorations: vscode.DecorationOptions[] = [
    {
      range: new vscode.Range(startPosition, endPosition),
    },
  ]
  activeEditor.setDecorations(smallNumberDecorationType, decorations)
}

function triggerUpdateDecorations() {
  if (timeout) {
    clearTimeout(timeout)
    timeout = undefined
  }
  timeout = setTimeout(updateDecorations, 20)
}

if (activeEditor) {
  triggerUpdateDecorations()
}

vscode.window.onDidChangeTextEditorSelection(event => {
  triggerUpdateDecorations()
})
vscode.workspace.onDidChangeTextDocument(event => {
  if (activeEditor && event.document === activeEditor.document) {
    triggerUpdateDecorations()
  }
})

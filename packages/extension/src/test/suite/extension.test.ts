import * as assert from 'assert'
import { before } from 'mocha'
import * as path from 'path'
import * as fs from 'fs'

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode'

const extension = vscode.extensions.getExtension('SimonSiefke.extension')
const activate = () => extension.activate()
interface Chainable {
  then: (fn: () => void | Promise<void> | Thenable<any>) => Chainable
  type: (text: string, speed?: number) => Chainable
  should: (assertion: 'have.text', expectedValue: string) => Chainable
  goBehind: (text: string) => Chainable
  goBefore: (text: string) => Chainable
  promise: () => Promise<void>
}

async function type(text: string): Promise<void> {
  await vscode.window.activeTextEditor.insertSnippet(
    new vscode.SnippetString(text),
    vscode.window.activeTextEditor.selection.active
  )
}

async function typeDelete(times: number = 1): Promise<void> {
  const offset = vscode.window.activeTextEditor.document.offsetAt(
    vscode.window.activeTextEditor.selection.active
  )
  await new Promise(async resolve => {
    await vscode.window.activeTextEditor.edit(editBuilder => {
      editBuilder.delete(
        new vscode.Range(
          vscode.window.activeTextEditor.document.positionAt(offset - times),
          vscode.window.activeTextEditor.document.positionAt(offset)
        )
      )
    })
    resolve()
  })
}

function createTestFile(fileName: string, content: string): Chainable {
  const filePath = path.join(__dirname, fileName)
  fs.writeFileSync(filePath, content)
  const uri = vscode.Uri.file(filePath)
  let promises: (() => Thenable<any> | void)[] = [
    async () => {
      await vscode.window.showTextDocument(uri)
    },
  ]
  const promise = async () => {
    while (promises.length) {
      await promises.shift()()
    }
  }
  let firstType: boolean = true
  const chainable: Chainable = {
    then(fn) {
      promises.push(fn)
      return chainable
    },
    goBefore(text) {
      promises.push(async () => {
        const editorText = vscode.window.activeTextEditor.document
          .getText
          // new vscode.Range(
          //   new vscode.Position(0, 0),
          //   vscode.window.activeTextEditor.selection.active
          // )
          ()
        const reversedText = text
          .split('')
          .reverse()
          .join('')
        let offset = editorText.length - 1
        outer: while (offset-- > 0) {
          for (let i = 0; i < reversedText.length; i++) {
            if (reversedText[i] !== editorText[offset - i]) {
              continue outer
            }
          }
          break
        }
        if (offset === 0 && !editorText.startsWith(text)) {
          throw new Error(`${text} doesn't exist`)
        }
        const position = vscode.window.activeTextEditor.document.positionAt(
          offset - text.length + 1
        )
        vscode.window.activeTextEditor.selection = new vscode.Selection(
          position,
          position
        )
      })
      return chainable
    },
    goBehind(text) {
      promises.push(async () => {
        const editorText = vscode.window.activeTextEditor.document.getText()
        let offset = editorText.length - 1
        outer: while (offset-- > 0) {
          for (let i = 0; i < text.length; i++) {
            if (text[i] !== editorText[offset + i]) {
              continue outer
            }
          }
          break
        }
        if (offset === editorText.length - 1 && !editorText.endsWith(text)) {
          throw new Error(`${text} doesn't exist`)
        }
        const position = vscode.window.activeTextEditor.document.positionAt(
          offset + text.length
        )
        vscode.window.activeTextEditor.selection = new vscode.Selection(
          position,
          position
        )
      })
      return chainable
    },
    type(text, speed = 150) {
      promises.push(async () => {
        if (speed >= 0) {
          let i = 0
          for (; i < text.length; i++) {
            if (firstType) {
              await new Promise(resolve => setTimeout(resolve, speed / 2))
              firstType = false
            } else {
              await new Promise(resolve => setTimeout(resolve, speed))
            }
            let deletes = 0
            if (text.slice(i).startsWith('{backspace}')) {
              deletes++
              i += '{backspace}'.length - 1
              // continue
            }
            if (deletes) {
              await typeDelete(deletes)
            } else {
              await type(text[i])
            }
          }
        } else {
          await type(text)
        }
      })
      return chainable
    },
    should(assertion, expectedValue) {
      promises.push(() => {
        switch (assertion) {
          case 'have.text':
            const text = vscode.window.activeTextEditor.document.getText()
            assert.equal(text, expectedValue)
            break
          default:
            break
        }
      })
      return chainable
    },
    promise,
  }
  return chainable
}

function waitForAutoComplete(times: number = 1) {
  return () =>
    new Promise((resolve, reject) => {
      let numberOfEvents = 0
      const disposable = vscode.workspace.onDidChangeTextDocument(() => {
        if (++numberOfEvents === times) {
          disposable.dispose()
          resolve()
        }
      })
      setTimeout(
        () =>
          reject(
            new Error(
              `completion does not work or is too slow and was called ${numberOfEvents} / ${times} times`
            )
          ),
        30 * times
      )
    })
}

suite('Extension Test Suite', () => {
  before(async () => {
    vscode.window.showInformationMessage('Start all tests.')
  })

  test('Auto Close Tag', async () => {
    await createTestFile('auto-close-tag.html', '')
      .then(activate)
      .type('<div>')
      .then(waitForAutoComplete())
      .should('have.text', '<div>\n  \n</div>')
      .type('<ul>')
      .then(waitForAutoComplete())
      .should('have.text', '<div>\n  <ul>\n    \n  </ul>\n</div>')
      .promise()
  })

  test('Auto Rename Tag', async () => {
    await createTestFile(
      'auto-rename-tag.html',
      '<div>\n  <ul>\n    \n  </ul>\n</div>'
    )
      .then(activate)
      .should('have.text', '<div>\n  <ul>\n    \n  </ul>\n</div>')
      .goBehind('</ul')
      .type('llll')
      .then(waitForAutoComplete())
      .should('have.text', '<div>\n  <ulllll>\n    \n  </ulllll>\n</div>')
      .type('{backspace}{backspace}{backspace}{backspace}')
      .then(waitForAutoComplete())
      .should('have.text', '<div>\n  <ul>\n    \n  </ul>\n</div>')
      .promise()
  })
})

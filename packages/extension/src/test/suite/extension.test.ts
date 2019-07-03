import * as assert from 'assert'
import { before, Test, test } from 'mocha'
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

async function setEditorContent(
  editor: vscode.TextEditor,
  content: string
): Promise<boolean> {
  const document = editor.document
  const all = new vscode.Range(
    document.positionAt(0),
    document.positionAt(document.getText().length)
  )
  return editor.edit(editBuilder => editBuilder.replace(all, content))
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

async function undo() {
  await vscode.commands.executeCommand('undo')
}

function createTestFile(fileName: string, content: string = ''): Chainable {
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

suite.skip('Extension Test Suite', () => {
  before(async () => {
    vscode.window.showInformationMessage('Start all tests.')
  })

  test('Auto Close Tag', async () => {
    await createTestFile('auto-close-tag.html', '')
      .then(activate)
      .type('<divs>')
      .then(waitForAutoComplete())
      .should('have.text', '<div>\n  \n</div>')
      .type('<ul>')
      .then(waitForAutoComplete())
      .should('have.text', '<div>\n  <ul>\n    \n  </ul>\n</div>')
      .promise()
  })
})

interface TestCase {
  input: string
  type: string
  expect: string
  only?: boolean
  speed?: number
  skip?: boolean
}

async function createTestFile2(
  fileName: string,
  content: string = ''
): Promise<void> {
  const filePath = path.join(__dirname, fileName)
  fs.writeFileSync(filePath, content)
  const uri = vscode.Uri.file(filePath)
  await vscode.window.showTextDocument(uri)
}

async function setText(text: string): Promise<void> {
  const document = vscode.window.activeTextEditor.document
  const all = new vscode.Range(
    document.positionAt(0),
    document.positionAt(document.getText().length)
  )
  await vscode.window.activeTextEditor.edit(editBuilder =>
    editBuilder.replace(all, text)
  )
}

function setCursorPosition(offset: number): void {
  const position = vscode.window.activeTextEditor.document.positionAt(offset)
  vscode.window.activeTextEditor.selection = new vscode.Selection(
    position,
    position
  )
}

async function typeLiteral(text: string): Promise<void> {
  await vscode.window.activeTextEditor.insertSnippet(
    new vscode.SnippetString(text),
    vscode.window.activeTextEditor.selection.active,
    {
      undoStopAfter: false,
      undoStopBefore: false,
    }
  )
}
async function type2(text: string, speed = 150): Promise<void> {
  for (let i = 0; i < text.length; i++) {
    if (i === 0) {
      await new Promise(resolve => setTimeout(resolve, speed / 2))
    } else {
      await new Promise(resolve => setTimeout(resolve, speed))
    }
    if (text.slice(i).startsWith('{backspace}')) {
      await typeDelete()
      i += '{backspace}'.length - 1
    } else if (text.slice(i).startsWith('{undo}')) {
      await vscode.commands.executeCommand('undo')
      i += '{undo}'.length - 1
    } else if (text.slice(i).startsWith('{redo}')) {
      await vscode.commands.executeCommand('redo')
      i += '{redo}'.length - 1
    } else {
      await typeLiteral(text[i])
    }
  }
}

async function waitForAutoComplete2() {
  return new Promise((resolve, reject) => {
    const disposable = vscode.workspace.onDidChangeTextDocument(() => {
      disposable.dispose()
      resolve()
    })
    setTimeout(resolve, 30)
  })
}

async function run(testCases: TestCase[]) {
  const only = testCases.find(testCase => testCase.only)
  const applicableTestCases = only ? [only] : testCases
  for (const testCase of applicableTestCases) {
    if (testCase.skip) {
      continue
    }
    const cursorOffset = testCase.input.indexOf('|')
    const input = testCase.input.replace('|', '')
    await setText(input)
    // await new Promise(resolve => setTimeout(resolve, 300))
    setCursorPosition(cursorOffset)
    await type2(testCase.type, testCase.speed || 150)
    await waitForAutoComplete2()
    const result = vscode.window.activeTextEditor.document.getText()
    assert.equal(result, testCase.expect)
  }
}

suite.only('Auto Rename Tag', () => {
  before(async () => {
    await createTestFile2('auto-rename-tag.html')
    await activate()
  })

  test('Cursor is at the back of a start tag', async () => {
    const testCases: TestCase[] = [
      {
        input: '<div|>test</div>',
        type: 's',
        expect: '<divs>test</divs>',
      },
      {
        input: '<div|>test</div>',
        type: '{backspace}',
        expect: '<di>test</di>',
      },
      {
        input: '<div|>test</div>',
        type: '{backspace}{backspace}{backspace}',
        expect: '<>test</>',
      },
      {
        input: '<div|>test</div>',
        type: ' ',
        expect: '<div >test</div>',
      },
      {
        input: '<div|>test</div>',
        type: ' c',
        expect: '<div c>test</div>',
      },
      {
        input: '<div|>test</div>',
        type: '{backspace}{backspace}{backspace} ',
        expect: '< >test</>',
      },
      {
        input: '<div|>test</div>',
        type: 'v{undo}',
        expect: '<div>test</div>',
      },
      {
        input: '<div|>test</div>',
        type: 'v{undo}{redo}',
        expect: '<divv>test</divv>',
      },
    ]
    await run(testCases)
  })

  test('Cursor at the front of a start tag', async () => {
    const testCases: TestCase[] = [
      {
        input: '<|div>test</div>',
        type: 's',
        expect: '<sdiv>test</sdiv>',
      },
    ]
    await run(testCases)
  })

  test('tag with class', async () => {
    const testCases: TestCase[] = [
      {
        input: '<div| class="css">test</div>',
        type: 'v',
        expect: '<divv class="css">test</divv>',
      },
      {
        input: '<div| class="css">test</div>',
        type: '{backspace}{backspace}{backspace}',
        expect: '< class="css">test</>',
        skip: true,
        // only: true,
        // speed: 550,
      },
      {
        input: '<div | class="css">test</div>',
        type: '{backspace}v',
        expect: '<divv class="css">test</divv>',
      },
    ]
    await run(testCases)
  })

  test('multiple line', async () => {
    const testCases: TestCase[] = [
      {
        input: '<div|>\n  test\n</div>',
        type: '{backspace}{backspace}{backspace}h3',
        expect: '<h3>\n  test\n</h3>',
      },
    ]
    await run(testCases)
  })

  test('div and a nested span', async () => {
    const testCases: TestCase[] = [
      {
        input: '<div|>\n  <span>test</span>\n</div>',
        type: '{backspace}{backspace}{backspace}h3',
        expect: '<h3>\n  <span>test</span>\n</h3>',
        skip: true,
      },
      {
        input: '<div>\n  <span|>test</span>\n</div>',
        type: '{backspace}{backspace}{backspace}{backspace}b',
        expect: '<div>\n  <b>test</b>\n</div>',
      },
      // {
      //   input: '<div>\n  <span|>test</span>\n</div>',
      // },
    ]
    await run(testCases)
  })

  test('nested div tags', async () => {
    const testCases: TestCase[] = [
      {
        input: '<div|>\n  <div>test</div>\n</div>',
        type: '{backspace}{backspace}{backspace}h3',
        expect: '<h3>\n  <div>test</div>\n</h3>',
        skip: true,
      },
      {
        input: '<div|>\n  <div>test</div>\n</div>',
        type: '{backspace}{backspace}{backspace}p',
        expect: '<div>\n  <p>test</p>\n</div>',
        skip: true,
      },
    ]
    await run(testCases)
  })

  test('dashed tag', async () => {
    const testCases: TestCase[] = [
      {
        input: '<dashed-div|>test</dashed-div>',
        type: '{backspace}{backspace}{backspace}{backspace}-span',
        expect: '<dashed-span>test</dashed-span>',
      },
    ]
    await run(testCases)
  })

  test('uppercase tag', async () => {
    const testCases: TestCase[] = [
      {
        input: '<DIV|>test</DIV>',
        type: 'S',
        expect: '<DIVS>test</DIVS>',
      },
    ]
    await run(testCases)
  })

  test('with class on second line', async () => {
    const testCases: TestCase[] = [
      {
        input: '<foo|\n  class="bar">foobar</foo>',
        type: '{backspace}',
        expect: '<fo\n  class="bar">foobar</fo>',
      },
    ]
    await run(testCases)
  })

  test('weird chars at start tag', async () => {
    const testCases: TestCase[] = [
      {
        input: '<foo\\n|  class="bar">foobar</foo>',
        type: 's',
        expect: '<foo\\ns  class="bar">foobar</foo>',
      },
      {
        input: '<foo|\\n  class="bar">foobar</foo>',
        type: 's',
        expect: '<foos\\n  class="bar">foobar</foos>',
      },
      {
        input: '<foo|( class="bar">foobar</foo>',
        type: '{backspace}',
        expect: '<fo( class="bar">foobar</fo>',
      },
    ]
    await run(testCases)
  })

  test('with incomplete inner tag', async () => {
    const testCases: TestCase[] = [
      {
        input: '<foo>\n<foo|\n</foo>',
        type: 'b',
        expect: '<foo>\n<foob\n</foo>',
      },
    ]
    await run(testCases)
  })

  test('end tag with inline div tag', async () => {
    const testCases: TestCase[] = [
      {
        input: '<div>test</div|>',
        type: 's',
        expect: '<divs>test</divs>',
      },
    ]
    await run(testCases)
  })
})

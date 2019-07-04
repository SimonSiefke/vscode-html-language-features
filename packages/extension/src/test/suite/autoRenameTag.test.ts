import * as assert from 'assert'
import { before, Test, test } from 'mocha'

// You can import and use all API from the 'vscode' module
import { activateExtension } from '../activateExtension'
import { TestCase, createTestFile, run } from '../test-utils'

// interface Chainable {
//   then: (fn: () => void | Promise<void> | Thenable<any>) => Chainable
//   type: (text: string, speed?: number) => Chainable
//   should: (assertion: 'have.text', expectedValue: string) => Chainable
//   goBehind: (text: string) => Chainable
//   goBefore: (text: string) => Chainable
//   promise: () => Promise<void>
// }

// async function type(text: string): Promise<void> {
//   await vscode.window.activeTextEditor.insertSnippet(
//     new vscode.SnippetString(text),
//     vscode.window.activeTextEditor.selection.active
//   )
// }

// async function setEditorContent(
//   editor: vscode.TextEditor,
//   content: string
// ): Promise<boolean> {
//   const document = editor.document
//   const all = new vscode.Range(
//     document.positionAt(0),
//     document.positionAt(document.getText().length)
//   )
//   return editor.edit(editBuilder => editBuilder.replace(all, content))
// }

// async function undo() {
//   await vscode.commands.executeCommand('undo')
// }

// function createTestFile(fileName: string, content: string = ''): Chainable {
//   const filePath = path.join(__dirname, fileName)
//   fs.writeFileSync(filePath, content)
//   const uri = vscode.Uri.file(filePath)
//   let promises: (() => Thenable<any> | void)[] = [
//     async () => {
//       await vscode.window.showTextDocument(uri)
//     },
//   ]
//   const promise = async () => {
//     while (promises.length) {
//       await promises.shift()()
//     }
//   }
//   let firstType: boolean = true
//   const chainable: Chainable = {
//     then(fn) {
//       promises.push(fn)
//       return chainable
//     },
//     goBefore(text) {
//       promises.push(async () => {
//         const editorText = vscode.window.activeTextEditor.document
//           .getText
//           // new vscode.Range(
//           //   new vscode.Position(0, 0),
//           //   vscode.window.activeTextEditor.selection.active
//           // )
//           ()
//         const reversedText = text
//           .split('')
//           .reverse()
//           .join('')
//         let offset = editorText.length - 1
//         outer: while (offset-- > 0) {
//           for (let i = 0; i < reversedText.length; i++) {
//             if (reversedText[i] !== editorText[offset - i]) {
//               continue outer
//             }
//           }
//           break
//         }
//         if (offset === 0 && !editorText.startsWith(text)) {
//           throw new Error(`${text} doesn't exist`)
//         }
//         const position = vscode.window.activeTextEditor.document.positionAt(
//           offset - text.length + 1
//         )
//         vscode.window.activeTextEditor.selection = new vscode.Selection(
//           position,
//           position
//         )
//       })
//       return chainable
//     },
//     goBehind(text) {
//       promises.push(async () => {
//         const editorText = vscode.window.activeTextEditor.document.getText()
//         let offset = editorText.length - 1
//         outer: while (offset-- > 0) {
//           for (let i = 0; i < text.length; i++) {
//             if (text[i] !== editorText[offset + i]) {
//               continue outer
//             }
//           }
//           break
//         }
//         if (offset === editorText.length - 1 && !editorText.endsWith(text)) {
//           throw new Error(`${text} doesn't exist`)
//         }
//         const position = vscode.window.activeTextEditor.document.positionAt(
//           offset + text.length
//         )
//         vscode.window.activeTextEditor.selection = new vscode.Selection(
//           position,
//           position
//         )
//       })
//       return chainable
//     },
//     type(text, speed = 150) {
//       promises.push(async () => {
//         if (speed >= 0) {
//           let i = 0
//           for (; i < text.length; i++) {
//             if (firstType) {
//               await new Promise(resolve => setTimeout(resolve, speed / 2))
//               firstType = false
//             } else {
//               await new Promise(resolve => setTimeout(resolve, speed))
//             }
//             let deletes = 0
//             if (text.slice(i).startsWith('{backspace}')) {
//               deletes++
//               i += '{backspace}'.length - 1
//               // continue
//             }
//             if (deletes) {
//               await typeDelete(deletes)
//             } else {
//               await type(text[i])
//             }
//           }
//         } else {
//           await type(text)
//         }
//       })
//       return chainable
//     },
//     should(assertion, expectedValue) {
//       promises.push(() => {
//         switch (assertion) {
//           case 'have.text':
//             const text = vscode.window.activeTextEditor.document.getText()
//             assert.equal(text, expectedValue)
//             break
//           default:
//             break
//         }
//       })
//       return chainable
//     },
//     promise,
//   }
//   return chainable
// }

// function waitForAutoComplete(times: number = 1) {
//   return () =>
//     new Promise((resolve, reject) => {
//       let numberOfEvents = 0
//       const disposable = vscode.workspace.onDidChangeTextDocument(() => {
//         if (++numberOfEvents === times) {
//           disposable.dispose()
//           resolve()
//         }
//       })
//       setTimeout(
//         () =>
//           reject(
//             new Error(
//               `completion does not work or is too slow and was called ${numberOfEvents} / ${times} times`
//             )
//           ),
//         30 * times
//       )
//     })
// }

// suite.skip('Extension Test Suite', () => {
//   before(async () => {
//     vscode.window.showInformationMessage('Start all tests.')
//   })

//   test('Auto Close Tag', async () => {
//     await createTestFile('auto-close-tag.html', '')
//       .then(activate)
//       .type('<divs>')
//       .then(waitForAutoComplete())
//       .should('have.text', '<div>\n  \n</div>')
//       .type('<ul>')
//       .then(waitForAutoComplete())
//       .should('have.text', '<div>\n  <ul>\n    \n  </ul>\n</div>')
//       .promise()
//   })
// })

suite.only('Auto Rename Tag', () => {
  before(async () => {
    await createTestFile('auto-rename-tag.html')
    await activateExtension()
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

  test('with comments', async () => {
    const testCases: TestCase[] = [
      {
        input: '<div|><!-- </div>',
        type: 'v',
        expect: '<divv><!-- </div>',
      },
      {
        input: '<div|><!-- </div> --> </div>',
        type: 'v',
        expect: '<divv><!-- </div> --> </divv>',
      },
      {
        input: '<div><!-- </div> --> </div|>',
        type: 'v',
        expect: '<divv><!-- </div> --> </divv>',
        skip: true,
      },
      {
        input: '<div><!-- <div> --> </div|>',
        type: 'v',
        expect: '<divv><!-- <div> --> </divv>',
        skip: true,
      },
      {
        input: '<div><!-- </div|> -->',
        type: 'v',
        expect: '<div><!-- </divv> -->',
      },
      {
        input: '<div><!-- <div|></div> -->',
        type: 'v',
        expect: '<div><!-- <divv></divv> -->',
      },
    ]
    await run(testCases)
  })
})

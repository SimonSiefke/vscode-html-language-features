import {
  TestCase,
  createTestFile,
  run,
  activateExtension,
  ciSlowNess,
} from '../test-utils'
import { before } from 'mocha'

const timeout = 300 * ciSlowNess

suite('Expand Tag', () => {
  before(async () => {
    await createTestFile('expand-tag.html')
    await activateExtension()
  })

  test('basic', async () => {
    const testCases: TestCase[] = [
      {
        input: '|',
        type: 'button',
        expect: '<button></button>',
      },
      {
        input: '|',
        type: '<!DOCTYPE html>\nhtml',
        expect: '<!DOCTYPE html>\n<html>\n  \n</html>',
      },
      {
        input: '<!DOCTYPE html>\n|',
        type: 'ht',
        expect: '<!DOCTYPE html>\n<html>\n  \n</html>',
      },
    ]
    await run(testCases, {
      timeout,
      afterCommands: [
        'editor.action.triggerSuggest',
        'acceptSelectedSuggestion',
      ],
    })
  })

  test('html document from scratch', async () => {
    const testCases: TestCase[] = [
      {
        input: '|',
        type: '<',
        expect: '<!DOCTYPE',
      },
      {
        type: ' html>',
        expect: '<!DOCTYPE html>',
        afterTypeCommands: [],
      },
      {
        type: '\nht',
        expect: '<!DOCTYPE html>\n<html>\n  \n</html>',
      },
      {
        type: 'h',
        expect: `
<!DOCTYPE html>
<html>
  <head>
    
  </head>
</html>
`.trim(),
      },
      {
        type: 'ti',
        expect: `
<!DOCTYPE html>
<html>
  <head>
    <title></title>
  </head>
</html>
`.trim(),
      },
      {
        type: 'Document',
        expect: `
<!DOCTYPE html>
<html>
  <head>
    <title>Document</title>
  </head>
</html>
`.trim(),
        afterTypeCommands: [],
      },
      {
        type: '{down}\nbo',
        expect: `
<!DOCTYPE html>
<html>
  <head>
    <title>Document</title>
  </head>
  <body>
    
  </body>
</html>
`.trim(),
      },
      {
        type: 'h1',
        expect: `
<!DOCTYPE html>
<html>
  <head>
    <title>Document</title>
  </head>
  <body>
    <h1></h1>
  </body>
</html>
`.trim(),
      },
      {
        type: 'hello world',
        expect: `
<!DOCTYPE html>
<html>
  <head>
    <title>Document</title>
  </head>
  <body>
    <h1>hello world</h1>
  </body>
</html>    
`.trim(),
        afterTypeCommands: [],
      },
    ]
    await run(testCases, {
      timeout,
      afterCommands: [
        'editor.action.triggerSuggest',
        'acceptSelectedSuggestion',
      ],
    })
  })
})

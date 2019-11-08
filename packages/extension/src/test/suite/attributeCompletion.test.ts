import {
  TestCase,
  createTestFile,
  run,
  activateExtension,
  ciSlowNess,
} from '../test-utils'
import { before } from 'mocha'

const timeout = 300 * ciSlowNess

suite.only('Attribute Completion', () => {
  before(async () => {
    await createTestFile('attribute-completion.html')
    await activateExtension()
  })

  test('input', async () => {
    const testCases: TestCase[] = [
      {
        input: '<input |',
        type: 'ty',
        expect: '<input type=""',
      },
      {
        input: '<input |',
        type: 'ty',
        expect: '<input type=""',
      },
      {
        input: '<input |',
        type: 'tdl',
        expect: '<input type="datetime-local"',
      },
      {
        input: '<input |',
        type: 'tt',
        expect: '<input type="tel"',
      },
      {
        input: '<input |',
        type: 'tti',
        expect: '<input type="time"',
      },
      {
        input: '<input |',
        type: 'tf',
        expect: '<input type="file"',
      },
      {
        input: '<input |',
        type: 'file',
        expect: '<input type="file"',
        skip: true,
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

  test('ol', async () => {
    const testCases: TestCase[] = [
      {
        input: '<ol |',
        type: 't',
        expect: '<ol tabindex=""',
      },
      {
        input: '<ol |',
        type: 'ty',
        expect: '<ol type=""',
      },
      {
        input: '<ol |',
        type: 't1',
        expect: '<ol type="1"',
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

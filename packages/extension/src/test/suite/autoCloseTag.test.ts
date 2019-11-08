import {
  TestCase,
  createTestFile,
  run,
  activateExtension,
  ciSlowNess,
} from '../test-utils'
import { before } from 'mocha'

const timeout = 300 * ciSlowNess

suite('Auto Close Tag', () => {
  before(async () => {
    await createTestFile('auto-close-tag.html')
    await activateExtension()
  })

  test('basic', async () => {
    const testCases: TestCase[] = [
      {
        input: '|',
        type: '<div>',
        expect: '<div>\n  \n</div>',
      },
      {
        input: '<div>\n  |\n</div>',
        type: '<ul>',
        expect: '<div>\n  <ul>\n    \n  </ul>\n</div>',
      },
      {
        input: '',
        type: '<input>',
        expect: '<input>',
      },
      {
        input: '',
        type: '<div>\n<img src="https://source.unsplash.com/random"></div>',
        expect: '<div>\n<img src="https://example.jpg"></div>',
        skip: true,
      },
      {
        input: '',
        type: '<!DOCTYPE html>',
        expect: '<!DOCTYPE html>',
      },
      {
        input: '',
        type: '<!doctype html>',
        expect: '<!doctype html>',
      },
    ]
    await run(testCases, { timeout })
  })
})

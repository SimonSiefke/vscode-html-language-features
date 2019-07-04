import {
  TestCase,
  createTestFile,
  run,
  activateExtension,
  closeTestFile,
} from '../test-utils'
import { before, after } from 'mocha'

suite('Emmet Complete Tag', () => {
  before(async () => {
    await createTestFile('emmet-complete-tag.html')
    await activateExtension()
  })

  // after(async () => {
  //   closeTestFile()
  // })

  test('basic', async () => {
    const testCases: TestCase[] = [
      {
        // TODO
        input: '!|',
        type: '{tab}',
        expect: '<!DOCTYPE html>...',
        skip: true,
      },
      {
        // TODO
        input: '<!DOCTYPE html>\nh|',
        type: '{tab}',
        expect: '<!DOCTYPE html>\n<html>\n  \n</html>',
        skip: true,
      },
      {
        input: '<!DOCTYPE html>\n<html>\n  h|\n</html>',
        type: '{tab}',
        expect: '<!DOCTYPE html>\n<html>\n  <head>\n    \n  </head>\n</html>',
      },
      {
        input:
          '<!DOCTYPE html>\n<html>\n  <head>\n    \n  </head>\n  b|\n</html>',
        type: '{tab}',
        expect:
          '<!DOCTYPE html>\n<html>\n  <head>\n    \n  </head>\n  <body>\n    \n  </body>\n</html>',
      },
      {
        input: '<ul>\n  l|\n</ul>',
        type: '{tab}',
        expect: '<ul>\n  <li></li>\n</ul>',
      },
      {
        // TODO endless loop
        input: '<ul>\n  <li></li>\n  l|\n</ul>',
        type: '{tab}',
        expect: '<ul>\n  <li></li>\n  <li></li>\n</ul>',
        skip: true,
      },
    ]
    await run(testCases)
  })

  test('snippets', async () => {
    const testCases: TestCase[] = [
      {
        input: '<head>l|</head>',
        type: '{tab}',
        expect: '<head><link rel="stylesheet" href="style.css"></head>',
        skip: true,
      },
      {
        input: '<head><link rel="stylesheet" href="style.css">l|</head>',
        type: '{tab}',
        expect:
          '<head><link rel="stylesheet" href="style.css"><link rel="stylesheet" href="style.css"></head>',
        skip: true,
      },
      {
        input: '<div>i|</div>',
        type: '{tab}',
        expect: '<div><img src="" alt=""></div>',
        skip: true,
      },
    ]
    await run(testCases)
  })
})

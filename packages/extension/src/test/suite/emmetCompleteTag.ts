import { TestCase, createTestFile, run, activateExtension } from '../test-utils'

suite('Auto Close Tag', () => {
  before(async () => {
    await createTestFile('emmet-complete-tag.html')
    await activateExtension()
  })

  test('basic', async () => {
    const testCases: TestCase[] = [
      {
        input: '!|',
        type: '{tab}',
        expect: '<!DOCTYPE html>...',
      },
      {
        input: '<!DOCTYPE html>\nh|',
        type: '{tab}',
        expect: '<!DOCTYPE html>\n<html>\n  \n</html>',
      },
      {
        input: '<!DOCTYPE html>\n<html>\n  h|\n</html>',
        type: '{tab}',
        expect: '<!DOCTYPE html>\n<html>\n  <head>\n    </head>\n</html>',
      },
      {
        input: '<!DOCTYPE html>\n<html>\n  <head>\n    </head>\n  b|</html>',
        type: '{tab}',
        expect:
          '<!DOCTYPE html>\n<html>\n  <head>\n    </head>\n  <body>\n  \n</body>\n</html>',
      },
      {
        input: '<ul>\nl|\n</ul>',
        type: '{tab}',
        expect: '<ul>\n<li></li>\n</ul>',
      },
      {
        input: '<ul>\n<li></li>\nl|</ul>',
        type: '{tab}',
        expect: '<ul>\n<li></li>\n<li></li>\n</ul>',
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
      },
      {
        input: '<head><link rel="stylesheet" href="style.css">l|</head>',
        type: '{tab}',
        expect:
          '<head><link rel="stylesheet" href="style.css"><link rel="stylesheet" href="style.css"></head>',
      },
      {
        input: '<div>i|</div>',
        type: '{tab}',
        expect: '<div><img src="" alt=""></div>',
      },
    ]
    await run(testCases)
  })
})

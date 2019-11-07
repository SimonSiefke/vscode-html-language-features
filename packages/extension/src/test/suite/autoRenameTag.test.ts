import { before, test } from 'mocha'
import { activateExtension, createTestFile, run, TestCase } from '../test-utils'

// const slowSpeed = 70
const slowSpeed = 95

suite('Auto Rename Tag', () => {
  before(async () => {
    await createTestFile('auto-rename-tag.html')
    await activateExtension()
  })

  test.skip('Cursor is at the back of a start tag', async () => {
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
    await run(testCases, { speed: slowSpeed })
  })

  test('multiple line', async () => {
    const testCases: TestCase[] = [
      {
        input: '<div|>\n  test\n</div>',
        type: '{backspace}{backspace}{backspace}h3',
        expect: '<h3>\n  test\n</h3>',
        speed: slowSpeed,
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
    await run(testCases, { speed: slowSpeed })
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
    await run(testCases, { speed: slowSpeed })
  })

  test('uppercase tag', async () => {
    const testCases: TestCase[] = [
      {
        input: '<DIV|>test</DIV>',
        type: 'S',
        expect: '<DIVS>test</DIVS>',
      },
    ]
    await run(testCases, { speed: slowSpeed })
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
        input: '<DatenSä|tze></DatenSätze>',
        type: 'ä',
        expect: '<DatenSäätze></DatenSäätze>',
        skip: true,
      },
      {
        input: '<foo\\n|  class="bar">foobar</foo>',
        type: 's',
        expect: '<foo\\ns  class="bar">foobar</foo>',
      },
      {
        input: '<foo|\\n  class="bar">foobar</foo>',
        type: 's',
        expect: '<foos\\n  class="bar">foobar</foos>',
        skip: true,
      },
      {
        input: '<foo|( class="bar">foobar</foo>',
        type: '{backspace}',
        expect: '<fo( class="bar">foobar</fo>',
        skip: true,
      },
    ]
    await run(testCases, { speed: slowSpeed })
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
        input: '<!-- <div|></div> -->',
        type: 'v',
        expect: '<!-- <divv></divv> -->',
        skip: true,
      },
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
      },
      {
        input: '<div><!-- <div> --> </div|>',
        type: 'v',
        expect: '<divv><!-- <div> --> </divv>',
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

import { getInfoAtOffset, Info } from './getInfoAtOffset'

test('empty', () => {
  expect(getInfoAtOffset('', 0)).toEqual({
    location: 'inside text',
    previousChar: '',
    previousOpenTagName: 'root',
  })
})

test('single char', () => {
  expect(getInfoAtOffset('a', 1)).toEqual({
    location: 'inside text',
    previousChar: 'a',
    previousOpenTagName: 'root',
  })
  expect(getInfoAtOffset('&', 1)).toEqual({
    location: 'inside text',
    previousChar: '&',
    previousOpenTagName: 'root',
  })
})

test('single opening angle bracket', () => {
  expect(getInfoAtOffset('<', 0)).toEqual({
    location: 'inside text',
    previousChar: '',
    previousOpenTagName: 'root',
  })
  expect(getInfoAtOffset('<', 1)).toEqual({
    location: 'partial-start-tag-name',
    offset: 1,
    parentTagName: 'root',
    partialTagName: '',
  })
})

test.skip('single closing angle bracket', () => {
  expect(getInfoAtOffset('>', 0)).toEqual({
    location: 'inside text',
    previousChar: '',
    previousOpenTagName: 'root',
  })
  expect(getInfoAtOffset('>', 1)).toEqual({
    location: 'inside text',
    previousChar: '>',
    previousOpenTagName: 'root',
  })
})

test('single slash', () => {
  expect(getInfoAtOffset('/', 0)).toEqual({
    location: 'inside text',
    previousChar: '',
    previousOpenTagName: 'root',
  })
  expect(getInfoAtOffset('/', 1)).toEqual({
    location: 'inside text',
    previousChar: '/',
    previousOpenTagName: 'root',
  })
})

test('simple tag', () => {
  const testCases: { input: string; expected: Info }[] = [
    {
      input: '|<h1>hello world</h1>',
      expected: {
        location: 'inside text',
        previousChar: '',
        previousOpenTagName: 'root',
      },
    },
    {
      input: '<|h1>hello world</h1>',
      expected: {
        location: 'partial-start-tag-name',
        offset: 1,
        parentTagName: 'root',
        partialTagName: '',
      },
    },
    {
      input: '<h|1>hello world</1=h1>',
      expected: {
        location: 'partial-start-tag-name',
        offset: 1,
        parentTagName: 'root',
        partialTagName: 'h',
      },
    },
    {
      input: '<h1|>hello world</h1>',
      expected: {
        location: 'partial-start-tag-name',
        offset: 1,
        parentTagName: 'root',
        partialTagName: 'h1',
      },
    },
    {
      input: '<h1>|hello world</h1>',
      expected: {
        location: 'inside text',
        previousChar: '>',
        previousOpenTagName: 'h1',
      },
    },
    {
      input: '<h1>h|ello world</h1>',
      expected: {
        location: 'inside text',
        previousChar: 'h',
        previousOpenTagName: 'h1',
      },
    },
    {
      input: '<h1>he|llo world</h1>',
      expected: {
        location: 'inside text',
        previousChar: 'e',
        previousOpenTagName: 'h1',
      },
    },
    {
      input: '<h1>hel|lo world</h1>',
      expected: {
        location: 'inside text',
        previousChar: 'l',
        previousOpenTagName: 'h1',
      },
    },
    {
      input: '<h1>hell|o world</h1>',
      expected: {
        location: 'inside text',
        previousChar: 'l',
        previousOpenTagName: 'h1',
      },
    },
    {
      input: '<h1>hello| world</h1>',
      expected: {
        location: 'inside text',
        previousChar: 'o',
        previousOpenTagName: 'h1',
      },
    },
    {
      input: '<h1>hello |world</h1>',
      expected: {
        location: 'inside text',
        previousChar: ' ',
        previousOpenTagName: 'h1',
      },
    },
    {
      input: '<h1>hello w|orld</h1>',
      expected: {
        location: 'inside text',
        previousChar: 'w',
        previousOpenTagName: 'h1',
      },
    },
    {
      input: '<h1>hello wo|rld</h1>',
      expected: {
        location: 'inside text',
        previousChar: 'o',
        previousOpenTagName: 'h1',
      },
    },
    {
      input: '<h1>hello wor|ld</h1>',
      expected: {
        location: 'inside text',
        previousChar: 'r',
        previousOpenTagName: 'h1',
      },
    },
    {
      input: '<h1>hello worl|d</h1>',
      expected: {
        location: 'inside text',
        previousChar: 'l',
        previousOpenTagName: 'h1',
      },
    },
    {
      input: '<h1>hello world|</h1>',
      expected: {
        location: 'inside text',
        previousChar: 'd',
        previousOpenTagName: 'h1',
      },
    },
    {
      input: '<h1>hello world<|/h1>',
      expected: {
        location: 'partial-start-tag-name',
        offset: 16,
        parentTagName: 'h1',
        partialTagName: '',
      },
    },
    {
      input: '<h1>hello world</|h1>',
      expected: {
        location: 'partial-closing-tag',
        previousOpenTagName: 'h1',
        partialClosingTagName: '',
        offset: 17,
      },
    },
    {
      input: '<h1>hello world</h|1>',
      expected: {
        location: 'partial-closing-tag',
        previousOpenTagName: 'h1',
        partialClosingTagName: 'h',
        offset: 17,
      },
    },
    {
      input: '<h1>hello world</h1|>',
      expected: {
        location: 'partial-closing-tag',
        previousOpenTagName: 'h1',
        partialClosingTagName: 'h1',
        offset: 17,
      },
    },
    {
      input: '<h1>hello world</h1>|',
      expected: {
        location: 'inside text',
        previousChar: '>',
        previousOpenTagName: 'root',
      },
    },
  ]

  for (const testCase of testCases) {
    const offset = testCase.input.indexOf('|')
    if (offset === -1) {
      throw new Error('invalid test case')
    }
    const text =
      testCase.input.slice(0, offset) + testCase.input.slice(offset + 1)
    const result = getInfoAtOffset(text, offset)
    expect(result).toEqual(testCase.expected)
  }
})

test('simple nested tag', () => {
  const testCases: { input: string; expected: Info }[] = [
    {
      input: '|<div><h1>hello world</h1></div>',
      expected: {
        location: 'inside text',
        previousChar: '',
        previousOpenTagName: 'root',
      },
    },
    {
      input: '<|div><h1>hello world</h1></div>',
      expected: {
        location: 'partial-start-tag-name',
        offset: 1,
        parentTagName: 'root',
        partialTagName: '',
      },
    },
    {
      input: '<d|iv><h1>hello world</h1></div>',
      expected: {
        location: 'partial-start-tag-name',
        offset: 1,
        parentTagName: 'root',
        partialTagName: 'd',
      },
    },
    {
      input: '<di|v><h1>hello world</h1></div>',
      expected: {
        location: 'partial-start-tag-name',
        offset: 1,
        parentTagName: 'root',
        partialTagName: 'di',
      },
    },
    {
      input: '<div|><h1>hello world</h1></div>',
      expected: {
        location: 'partial-start-tag-name',
        offset: 1,
        parentTagName: 'root',
        partialTagName: 'div',
      },
    },
    {
      input: '<div>|<h1>hello world</h1></div>',
      expected: {
        location: 'inside text',
        previousChar: '>',
        previousOpenTagName: 'div',
      },
    },
    {
      input: '<div><|h1>hello world</h1></div>',
      expected: {
        location: 'partial-start-tag-name',
        offset: 6,
        parentTagName: 'div',
        partialTagName: '',
      },
    },
    {
      input: '<div><h|1>hello world</h1></div>',
      expected: {
        location: 'partial-start-tag-name',
        offset: 6,
        parentTagName: 'div',
        partialTagName: 'h',
      },
    },
    {
      input: '<div><h|1>hello world</h1></div>',
      expected: {
        location: 'partial-start-tag-name',
        offset: 6,
        parentTagName: 'div',
        partialTagName: 'h',
      },
    },
    {
      input: '<div><h1|>hello world</h1></div>',
      expected: {
        location: 'partial-start-tag-name',
        offset: 6,
        parentTagName: 'div',
        partialTagName: 'h1',
      },
    },
    {
      input: '<div><h1>|hello world</h1></div>',
      expected: {
        location: 'inside text',
        previousChar: '>',
        previousOpenTagName: 'h1',
      },
    },
    {
      input: '<div><h1>hello| world</h1></div>',
      expected: {
        location: 'inside text',
        previousChar: 'o',
        previousOpenTagName: 'h1',
      },
    },
    {
      input: '<div><h1>hello world|</h1></div>',
      expected: {
        location: 'inside text',
        previousChar: 'd',
        previousOpenTagName: 'h1',
      },
    },
    {
      input: '<div><h1>hello world<|/h1></div>',
      expected: {
        location: 'partial-start-tag-name',
        offset: 21,
        parentTagName: 'h1',
        partialTagName: '',
      },
    },
    {
      input: '<div><h1>hello world</|h1></div>',
      expected: {
        location: 'partial-closing-tag',
        offset: 22,
        partialClosingTagName: '',
        previousOpenTagName: 'h1',
      },
    },
    {
      input: '<div><h1>hello world</h|1></div>',
      expected: {
        location: 'partial-closing-tag',
        offset: 22,
        partialClosingTagName: 'h',
        previousOpenTagName: 'h1',
      },
    },
    {
      input: '<div><h1>hello world</h1|></div>',
      expected: {
        location: 'partial-closing-tag',
        offset: 22,
        partialClosingTagName: 'h1',
        previousOpenTagName: 'h1',
      },
    },
    {
      input: '<div><h1>hello world</h1>|</div>',
      expected: {
        location: 'inside text',
        previousChar: '>',
        previousOpenTagName: 'div',
      },
    },
    {
      input: '<div><h1>hello world</h1><|/div>',
      expected: {
        location: 'partial-start-tag-name',
        offset: 26,
        parentTagName: 'div',
        partialTagName: '',
      },
    },
    {
      input: '<div><h1>hello world</h1></|div>',
      expected: {
        location: 'partial-closing-tag',
        offset: 27,
        partialClosingTagName: '',
        previousOpenTagName: 'div',
      },
    },
    {
      input: '<div><h1>hello world</h1></d|iv>',
      expected: {
        location: 'partial-closing-tag',
        offset: 27,
        partialClosingTagName: 'd',
        previousOpenTagName: 'div',
      },
    },
    {
      input: '<div><h1>hello world</h1></di|v>',
      expected: {
        location: 'partial-closing-tag',
        offset: 27,
        partialClosingTagName: 'di',
        previousOpenTagName: 'div',
      },
    },
    {
      input: '<div><h1>hello world</h1></div|>',
      expected: {
        location: 'partial-closing-tag',
        offset: 27,
        partialClosingTagName: 'div',
        previousOpenTagName: 'div',
      },
    },
    {
      input: '<div><h1>hello world</h1></div>|',
      expected: {
        location: 'inside text',
        previousChar: '>',
        previousOpenTagName: 'root',
      },
    },
  ]

  for (const testCase of testCases) {
    const offset = testCase.input.indexOf('|')
    if (offset === -1) {
      throw new Error('invalid test case')
    }
    const text =
      testCase.input.slice(0, offset) + testCase.input.slice(offset + 1)
    const result = getInfoAtOffset(text, offset)
    expect(result).toEqual(testCase.expected)
  }
})

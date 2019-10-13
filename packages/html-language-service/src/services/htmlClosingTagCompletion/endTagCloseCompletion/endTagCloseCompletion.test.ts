// import { doEndTagCloseCompletion } from './endTagCloseCompletion'
// import { DoCompletion } from '../htmlClosingTagCompletion'
// import { addConfig } from '../../../data/HTMLManager'

// const createExpectCompletion: (
//   doCompletion: DoCompletion
// ) => (
//   input: string
// ) => {
//   toBe: (expected: string) => void
// } = doCompletion => input => {
//   const offset = input.indexOf('|')
//   input = input.replace('|', '')
//   const completion = doCompletion(input, offset)
//   const result = `${input}${(completion || '').replace('$0', '')}`
//   return {
//     toBe(expected: string) {
//       expect(result).toBe(expected)
//     },
//   }
// }

// const expectEndTagCloseCompletion = createExpectCompletion(
//   doEndTagCloseCompletion
// )

// interface TestCase {
//   input: string
//   expect: string
//   only?: boolean
//   skip?: boolean
// }

// function run(testCases: TestCase[]) {
//   const only = testCases.filter(testCase => testCase.only)
//   const applicableTestCases = only.length ? only : testCases
//   for (const testCase of applicableTestCases) {
//     if (testCase.skip) {
//       continue
//     }
//     const cursorOffset = testCase.input.indexOf('|')
//     const input = testCase.input.replace('|', '')
//     const completion = doEndTagCloseCompletion(input, cursorOffset)
//     const result = `${input}${(completion || '').replace('$0', '')}`
//     expect(result).toBe(testCase.expect)
//   }
// }

// beforeAll(() => {
//   addConfig({
//     elements: {
//       input: {
//         'self-closing': true,
//       },
//     },
//   })
// })

// test('end tag close completion', () => {
//   const testCases: TestCase[] = [
//     {
//       input: '<h1>hello world</|',
//       expect: '<h1>hello world</h1>',
//     },
//     {
//       input: '<h1>\nhello world</|',
//       expect: '<h1>\nhello world</h1>',
//     },
//     {
//       // TODO unknown token type
//       input: '<div></|</div>',
//       expect: '<div></</div>',
//       skip: true,
//     },
//     {
//       // TODO unknown token type
//       input: '<div><div></|</div>',
//       expect: '<div></div></div></div>',
//       skip: true,
//     },
//     {
//       // TODO endless loop
//       input: '<div><div></div></|',
//       expect: '<div></div></div></div>',
//       skip: true,
//     },
//     {
//       // TODO: endless loop
//       input: '<div><input></|',
//       expect: '<div><input></div>',
//       skip: true,
//     },
//     {
//       input: '<a>\n  <input>\n  </|\n</a>',
//       expect: '<a>\n  <input>\n  </\n</a>',
//     },
//     {
//       input: '<a>\n  <input>\n  </|',
//       expect: '<a>\n  <input>\n  </a>',
//     },
//   ]
//   run(testCases)
// })

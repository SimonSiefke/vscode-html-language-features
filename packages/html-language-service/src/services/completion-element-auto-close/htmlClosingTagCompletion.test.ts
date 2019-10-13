// import { addConfig } from '../../data/HTMLManager'
// import { DoCompletion } from '../htmlClosingTagCompletion/htmlClosingTagCompletion'

// beforeAll(() => {
//   addConfig({
//     elements: {
//       input: {
//         'self-closing': true,
//       },
//       ul: {
//         newline: true,
//       },
//     },
//   })
// })

// const createExpectCompletion: (
//   doCompletion: DoCompletion
// ) => (
//   input: string
// ) => {
//   toBe: (expected: string) => void
// } = doCompletion => input => {
//   const offset = input.length
//   const completion = doCompletion(input, offset)
//   const result = `${input}${(completion || '').replace('$0', '')}`
//   return {
//     toBe(expected: string) {
//       expect(result).toBe(expected)
//     },
//   }
// }

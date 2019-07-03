/* eslint-disable no-param-reassign */
import { doEndTagCloseCompletion } from './endTagCloseCompletion'
import { DoCompletion } from '../htmlClosingTagCompletion'

const createExpectCompletion: (
  doCompletion: DoCompletion
) => (
  input: string
) => {
  toBe: (expected: string) => void
} = doCompletion => input => {
  const offset = input.indexOf('|')
  input = input.replace('|', '')
  const completion = doCompletion(input, offset)
  const result = `${input}${(completion || '').replace('$0', '')}`
  return {
    toBe(expected: string) {
      expect(result).toBe(expected)
    },
  }
}

const expectEndTagCloseCompletion = createExpectCompletion(
  doEndTagCloseCompletion
)

test('end tag close completion', () => {
  expectEndTagCloseCompletion('<h1>hello world</|').toBe('<h1>hello world</h1>')
  expectEndTagCloseCompletion('<h1>\nhello world</|').toBe(
    '<h1>\nhello world</h1>'
  )
  // expectEndTagCloseCompletion('<h1>hello world</|</').toBe(
  //   '<h1>hello world</h1></'
  // )
  expectEndTagCloseCompletion('<div></|</div>').toBe('<div></</div>')
  expectEndTagCloseCompletion('<div><div></|</div>').toBe(
    '<div></div></div></div>'
  )
  expectEndTagCloseCompletion('<div><div></div></|').toBe(
    '<div></div></div></div>'
  )
  expectEndTagCloseCompletion('<div><input></|').toBe('')
})

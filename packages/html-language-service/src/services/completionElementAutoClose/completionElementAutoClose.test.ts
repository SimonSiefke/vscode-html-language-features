import { doCompletionElementAutoClose } from './completionElementAutoClose'
import { addConfig } from '../../data/HTMLManager'
import { DoCompletion } from '../htmlClosingTagCompletion/htmlClosingTagCompletion'

const createExpectCompletion: (
  doCompletion: DoCompletion
) => (
  input: string
) => {
  toBe: (expected: string) => void
} = doCompletion => input => {
  const offset = input.length
  const completion = doCompletion(input, offset)
  const result = `${input}${(completion || '').replace('$0', '')}`
  return {
    toBe(expected: string) {
      expect(result).toBe(expected)
    },
  }
}

const expectEndTagAutoCloseCompletion = createExpectCompletion(
  doCompletionElementAutoClose
)

beforeAll(() => {
  addConfig({
    elements: {
      input: {
        'self-closing': true,
      },
      ul: {
        newline: true,
      },
    },
  })
})

test('end tag auto close completion', () => {
  expectEndTagAutoCloseCompletion('h1>').toBe('h1>')
  expectEndTagAutoCloseCompletion('<h1>').toBe('<h1></h1>')
  expectEndTagAutoCloseCompletion('<h1></h1>').toBe('<h1></h1>')
  expectEndTagAutoCloseCompletion('<ul>').toBe('<ul>\n\t\n</ul>')
  expectEndTagAutoCloseCompletion('<input>').toBe('<input>')
  expectEndTagAutoCloseCompletion('<<<').toBe('<<<')
  expectEndTagAutoCloseCompletion('<div class="<div>').toBe(
    '<div class="<div></div>'
  )
})

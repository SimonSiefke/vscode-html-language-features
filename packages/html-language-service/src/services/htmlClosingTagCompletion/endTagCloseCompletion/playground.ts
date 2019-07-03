import { doEndTagCloseCompletion } from './endTagCloseCompletion'
import { addSchema } from '../../../data/HTMLManager'

addSchema({
  elements: {
    input: {
      'self-closing': true,
    },
  },
})

const doIt = text => {
  // let text = '<div><input>|</div>'
  const offset = text.indexOf('|')
  text = text.replace('|', '')

  const completion = doEndTagCloseCompletion(text, offset)
  const result = completion ? text + completion : undefined
  result // ?
}

// const text = '<div><input></|'
const text = '<div></div><input></|'
doIt(text)

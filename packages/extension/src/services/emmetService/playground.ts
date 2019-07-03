import { expand } from '@emmetio/expand-abbreviation'
import * as extract from '@emmetio/extract-abbreviation'

const text = '<div></div>ul>li*5'
const extracted = extract(text) // ?
expand(extracted.abbreviation, {
  syntax: 'html',
  field(index, placeholder) {
    return `\${${index}${placeholder ? `:${placeholder}` : ''}}`
  },
}) // ?

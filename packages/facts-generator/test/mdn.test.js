const mdnData = require('../src/configs/generated/mdn.htmlData.json')

const testEmptyElements = () => {
  const emptyElements = [
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr',
    'command',
    'keygen',
    'menuitem',
  ]

  for (const emptyElement of emptyElements) {
    const data = mdnData.elements[emptyElement]
    if (!data) {
      throw new Error('missing' + emptyElement)
    }
    if (!data.selfClosing) {
      throw new Error('expected ' + emptyElement + ' to be self-closing')
    }
  }
}
testEmptyElements()

// TODO
const testInputElement = () => {
  const data = mdnData.elements.input
  const attributes = data.attributes //?
  const expectedAttributes = [
    'autocomplete',
    'autofocus',
    'disabled',
    'form',
    'list',
    'name',
    'readonly',
    'required',
    'tabindex',
    'type',
    'value',
  ]
  if (attributes.length !== expectedAttributes.length) {
    throw new Error('different number of attributes')
  }
  for (const expectedAttribute of expectedAttributes) {
    if (!attributes[expectedAttribute]) {
      throw new Error('expected input to have attribute ' + expectedAttribute)
    }
  }
}
// testInputElement()

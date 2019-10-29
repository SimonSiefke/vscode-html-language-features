/* eslint-disable no-await-in-loop */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-param-reassign */
import fetch from 'node-fetch'
import * as fs from 'fs'
import * as path from 'path'

const vueConfigs = [
  'https://raw.githubusercontent.com/ElementUI/element-helper-json/master/element-tags.json',
]

const transform: any = original => {
  const elementNames = Object.keys(original)
  for (const elementName of elementNames) {
    for (const key of ['attributes', 'attribute', 'defaults', 'subtags']) {
      delete original[elementName][key]
    }
  }
  return {
    elements: original,
  }
}
;(async () => {
  for (const url of vueConfigs) {
    const content = await fetch(url).then(res => res.json())
    const transformed = transform(content)
    fs.writeFileSync(
      path.join(
        __dirname,
        `../generated/${url.split('/')[url.split('/').length - 1]}`
      ),
      `${JSON.stringify(transformed, undefined, 2)}\n`
    )
  }
})()

const fs = require('fs-extra')
const path = require('path')
const { mergeConfigs } = require('@html-language-features/schema')

const files = fs.readdirSync(path.join(__dirname, '../src'))
const contents = files.map(file =>
  fs.readFileSync(path.join(__dirname, '../src', file), 'utf-8')
)
const configs = contents.map(config => JSON.parse(config))
const finalConfig = mergeConfigs(...configs)

if ('errors' in finalConfig) {
  console.error(finalConfig.errors)
  throw new Error('invalid config')
}
fs.ensureDirSync(path.join(__dirname, '../generated'))
fs.writeFileSync(
  path.join(__dirname, '../generated/curated.htmlData.json'),
  JSON.stringify(finalConfig, null, 2) + '\n'
)

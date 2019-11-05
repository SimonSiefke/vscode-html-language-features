const fs = require('fs-extra')
const path = require('path')
const { mergeConfigs } = require('@html-language-features/schema')

const processDirectory = directory => {
  const files = fs.readdirSync(path.join(__dirname, '../src', directory))
  const contents = files.map(file =>
    fs.readFileSync(path.join(__dirname, '../src', directory, file), 'utf-8')
  )
  const configs = contents.map(config => JSON.parse(config))
  const finalConfig = mergeConfigs(...configs)

  if ('errors' in finalConfig) {
    console.error(finalConfig.errors)
    throw new Error('invalid config')
  }
  fs.ensureDirSync(path.join(__dirname, '../generated', directory))
  fs.writeFileSync(
    path.join(__dirname, '../generated/', directory, 'curated.htmlData.json'),
    JSON.stringify(finalConfig, null, 2) + '\n'
  )
}

processDirectory('wired-elements')
processDirectory('general-facts')

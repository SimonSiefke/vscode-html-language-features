const fs = require('fs-extra')
const path = require('path')
const { mergeConfigs } = require('@html-language-features/schema')
const configs = fs.readdirSync(path.join(__dirname, '../tmp-generated')) //?

const contents = configs.map(config =>
  fs.readFileSync(path.join(__dirname, '../tmp-generated', config), 'utf-8')
) //?

const parsedConfigs = contents.map(content => JSON.parse(content))

const mergedConfigs = []
for (let i = 0; i < parsedConfigs.length; i += 2) {
  const attributeConfig = parsedConfigs[i]
  const tagConfig = parsedConfigs[i + 1]
  const mergedConfig = mergeConfigs(attributeConfig, tagConfig)
  if ('errors' in mergedConfig) {
    throw new Error('failed to merge configs')
  }
  mergedConfigs.push(mergedConfig)
}

const finalConfig = mergeConfigs(...mergedConfigs)
if ('errors' in finalConfig) {
  throw new Error('failed to merge configs')
}

fs.ensureDirSync(path.join(__dirname, '../generated'))
fs.writeFileSync(
  path.join(__dirname, '../generated', 'generated.htmlData.json'),
  JSON.stringify(finalConfig, null, 2) + '\n'
)

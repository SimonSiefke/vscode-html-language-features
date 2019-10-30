const fs = require('fs')
const path = require('path')
const { getConfig } = require('../../dist/getConfig')

const root = path.join(__dirname, '..')
const configs = fs.readdirSync(path.join(root, 'src/configs'))

for (const config of configs) {
  const isFile = fs.statSync(path.join(root, 'src/configs', config)).isFile()
  if (!isFile || !config.endsWith('.json')) {
    continue
  }
  const generatedConfig = getConfig(path.join(root, 'src/configs', config))
  fs.writeFileSync(
    path.join(root, 'src/configs/generated', config),
    JSON.stringify(generatedConfig, null, 2) + '\n'
  )
}

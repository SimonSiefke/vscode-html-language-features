const path = require('path')
const fs = require('fs-extra')

const root = path.join(__dirname, '..')

if (!fs.existsSync(path.join(root, 'dist'))) {
  fs.mkdirSync(path.join(root, 'dist'))
}

// @ts-ignore
const pkg = require('../packages/extension/package.json')

pkg.main = './packages/extension/dist/extensionMain.js'

delete pkg.dependencies
delete pkg.devDependencies
delete pkg.scripts
delete pkg.enableProposedApi

fs.writeFileSync(
  path.join(root, 'dist/package.json'),
  `${JSON.stringify(pkg, null, 2)}\n`
)

fs.copySync(
  path.join(root, 'packages/extension/dist'),
  path.join(root, 'dist/packages/extension/dist')
)
fs.copySync(
  path.join(root, 'packages/html-language-server/dist'),
  path.join(root, 'dist/packages/html-language-server/dist')
)

let extensionMain = fs
  .readFileSync(
    path.join(root, `dist/packages/extension/dist/extensionMain.js`)
  )
  .toString()

extensionMain = extensionMain.replace(
  '../html-language-server/dist/htmlLanguageServerMain.js',
  './packages/html-language-server/dist/htmlLanguageServerMain.js'
)

fs.writeFileSync(
  path.join(root, `dist/packages/extension/dist/extensionMain.js`),
  extensionMain
)

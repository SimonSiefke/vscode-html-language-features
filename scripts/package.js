const path = require('path')
const fs = require('fs-extra')
const { exec } = require('child_process')

const root = path.join(__dirname, '..')

if (!fs.existsSync(path.join(root, 'dist'))) {
  fs.mkdirSync(path.join(root, 'dist'))
}

// @ts-ignore
const pkg = require('../packages/extension/package.json')

pkg.main = './packages/extension/dist/extensionMain.js'

// for (const d in pkg.dependencies) {
//   if (!d.includes('vscode')) {
//     delete pkg.dependencies[d]
//   }
// }
// for (const d in pkg.devDependencies) {
//   if (!d.includes('vscode')) {
//     delete pkg.devDependencies[d]
//   }
// }
// delete pkg.dependencies
// delete pkg.devDependencies
// delete pkg.enableProposedApi
fs.writeFileSync(
  path.join(root, 'dist/package.json'),
  `${JSON.stringify(pkg, null, 2)}\n`
)

// for (const file of ['icon.png']) {
//   fs.copySync(path.join(root, `packages/extension/${file}`), `dist/${file}`)
// }

fs.copyFileSync(path.join(root, 'lerna.json'), 'dist/lerna.json')

const dirs = [
  'extension',
  'html-intellicode',
  'html-language-service',
  'html-language-server',
  'html-parser',
  'schema',
]

for (const dir of dirs) {
  fs.copySync(
    path.join(root, `packages/${dir}/dist`),
    `dist/packages/${dir}/dist`
  )
  fs.copySync(
    path.join(root, `packages/${dir}/package.json`),
    `dist/packages/${dir}/package.json`,
    {
      dereference: true,
    }
  )
}

// fs.copySync(
//   path.join(root, `packages/extension/dist`),
//   `dist/packages/extension/dist`
// )
// fs.copySync(
//   path.join(root, `packages/preview/dist`),
//   `dist/packages/preview/dist`
// )
// for (const file of ['README.md', 'LICENSE']) {
//   fs.copySync(path.join(root, file), `dist/${file}`)
// }

function fixLanguageClientFile() {
  let languageClientFile = fs
    .readFileSync(
      path.join(
        root,
        `packages/extension/dist/services/htmlLanguageClient/htmlLanguageClientService.js`
      )
    )
    .toString()

  languageClientFile = languageClientFile.replace(
    '../html-language-server/dist/htmlLanguageServerMain.js',
    './packages/html-language-server/dist/htmlLanguageServerMain.js'
  )

  fs.writeFileSync(
    path.join(
      root,
      `dist/packages/extension/dist/services/htmlLanguageClient/htmlLanguageClientService.js`
    ),
    languageClientFile
  )
}
exec('cd dist && npm install && lerna bootstrap', err => {
  if (err) {
    console.error(`exec error: ${err}`)
    process.exit(1)
  }
  fixLanguageClientFile()
  console.log('done')
})

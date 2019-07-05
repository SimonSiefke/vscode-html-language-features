const withDefaults = require('./shared.webpack.config')
const path = require('path')

const context = path.join(__dirname, 'packages/html-language-server')

module.exports = withDefaults({
  context,
  entry: {
    extension: './src/htmlLanguageServerMain.ts',
  },
  output: {
    filename: 'htmlLanguageServerMain.js',
    path: path.join(context, 'dist'),
  },
})

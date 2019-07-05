const withDefaults = require('./shared.webpack.config')
const path = require('path')

const context = path.join(__dirname, 'packages/extension')

module.exports = withDefaults({
  context,
  entry: {
    extension: './src/extensionMain.ts',
  },
  output: {
    filename: 'extensionMain.js',
    path: path.join(context, 'dist'),
  },
})

const withDefaults = require('./shared.webpack.config')
const path = require('path')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin

module.exports = withDefaults({
  context: path.join(__dirname, 'packages/html-language-server'),
  entry: {
    extension: './src/htmlLanguageServerMain.ts',
  },
  output: {
    filename: 'htmlLanguageServerMain.js',
    path: path.join(__dirname, 'dist', 'packages/html-language-server/dist'),
  },
  // plugins: [new BundleAnalyzerPlugin()],
})

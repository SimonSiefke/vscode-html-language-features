const withDefaults = require('./shared.webpack.config')
const path = require('path')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin

module.exports = withDefaults({
  context: path.join(__dirname, 'packages/extension'),
  entry: {
    extension: './src/extensionMain.ts',
  },
  output: {
    filename: 'extensionMain.js',
    path: path.join(__dirname, 'dist', 'packages/extension/dist'),
  },
  plugins: [new BundleAnalyzerPlugin()],
})

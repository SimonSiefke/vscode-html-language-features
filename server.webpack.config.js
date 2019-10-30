const withDefaults = require('./shared.webpack.config')
const path = require('path')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin

module.exports = withDefaults({
  context: path.join(__dirname, 'packages/html-language-server'),
  entry: {
    htmlLanguageServerMain: './src/htmlLanguageServerMain.ts',
  },
  optimization: {
    splitChunks: {
      minSize: 0,
      cacheGroups: {
        json: {
          test: /\.json$/,
          chunks: 'all',
          priority: -10,
          name: 'json-stats',
        },
        'vscode-dependencies': {
          test: /node_modules\/vscode/,
          chunks: 'all',
          name: 'vscode-dependencies',
        },
      },
    },
  },
  output: {
    filename: '[name].js',
    path: path.join(__dirname, 'dist', 'packages/html-language-server/dist'),
  },
  // plugins: [new BundleAnalyzerPlugin()],
})

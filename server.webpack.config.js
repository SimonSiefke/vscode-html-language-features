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
    minimize: false,
    runtimeChunk: 'multiple',
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: Infinity,
      minSize: 0,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            // get the name. E.g. node_modules/packageName/not/this/part.js
            // or node_modules/packageName
            const packageName = module.context.match(
              /[\\/]node_modules[\\/](.*?)([\\/]|$)/
            )[1]

            if (packageName.includes('@html-language-features')) {
              return `core.${packageName.replace('@', '')}`
            }

            // npm package names are URL-safe, but some servers don't like @ symbols
            return `npm.${packageName.replace('@', '')}`
          },
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

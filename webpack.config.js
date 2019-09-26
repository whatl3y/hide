var nodeExternals = require('webpack-node-externals')

module.exports = {
  mode: 'production',
  entry: [
    'core-js/stable',
    'regenerator-runtime/runtime',
    './src/index.js'
  ],
  target: 'node',
  output: {
    filename: 'hide',
  },
  externals: [ nodeExternals() ],
  module: {
    rules: [{
      test: /\.m?js$/,
      loader: 'babel-loader',
    }]
  },
  resolve: {
    alias: {
      // https://medium.com/js-dojo/how-to-reduce-your-vue-js-bundle-size-with-webpack-3145bf5019b7
      moment: 'moment/src/moment'
    }
  }
}

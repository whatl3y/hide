var nodeExternals = require('webpack-node-externals')

module.exports = {
  mode: 'production',
  entry: [  'babel-polyfill', './src/index.js' ],
  target: 'node',
  output: {
    filename: 'index.js',
  },
  externals: [ nodeExternals() ],
  module: {
    rules: [{
      test: /^.+\.js$/,
      loader: 'babel-loader',
    }]
  }
}

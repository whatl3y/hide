var nodeExternals = require('webpack-node-externals')

module.exports = {
  entry: ['babel-polyfill', './src/index.js'],
  target: 'node',
  output: {
    filename: 'index.js',
  },
  externals: [nodeExternals()],
  module: {
    loaders: [{
      test: /^.+\.js$/,
      loader: 'babel-loader',
      options: {
        presets: ['es2015']
      }
    }]
  }
}

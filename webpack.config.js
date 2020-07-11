var nodeExternals = require('webpack-node-externals')

module.exports = {
  mode: 'production',
  entry: ['./src/index.ts'],
  target: 'node',
  output: {
    filename: 'hide',
  },
  externals: [nodeExternals()],
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.ts$/, loader: 'ts-loader' },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      // https://medium.com/js-dojo/how-to-reduce-your-vue-js-bundle-size-with-webpack-3145bf5019b7
      moment: 'moment/src/moment',
    },
  },
}

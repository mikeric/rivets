var webpack = require('webpack')

module.exports = {
  context: __dirname,
  entry: './src/export',

  output: {
    path: __dirname + '/dist',
    filename: 'rivets.bundled.js',
    library: 'rivets',
    libraryTarget: 'umd'
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: '/node_modules/',
        loader: 'babel-loader'
      }
    ]
  },

  resolve: {
    extensions: ['', '.js']
  }
}

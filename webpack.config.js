var webpack = require('webpack');
var minimize = process.argv.indexOf('-p') === -1 ? false : true;

module.exports = {
  context: __dirname,
  entry: './src/export',

  output: {
    path: __dirname + '/dist',
    filename: 'rivets.bundled' + (minimize ? '.min.' : '.') + 'js',
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

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
        loader: 'babel',
        query: {
            presets: ['es2015'],
            plugins: [
                'add-module-exports',
                'transform-es2015-modules-umd'
            ]
        }
      }
    ]
  },

  resolve: {
    extensions: ['', '.js']
  }
}

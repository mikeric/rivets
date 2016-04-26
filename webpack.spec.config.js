module.exports = {
  context: __dirname,
  entry: "./src/parsers",
  output: {
    path: __dirname + "/spec/lib",
    filename: "parsers.js",
    library: 'parsers',
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
  }
}
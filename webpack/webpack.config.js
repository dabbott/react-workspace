const path = require('path')
const webpack = require('webpack')

const DIRECTORY = path.dirname(__dirname)

module.exports = {
  devServer: {
    contentBase: DIRECTORY
  },
  entry: {
    index: path.join(DIRECTORY, 'index.js'),
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          cacheDirectory: true,
          presets: [
            'es2015',
            'react',
            'stage-0'
          ],
        },
      },
      {
        test: /\.json$/,
        loader: 'json-loader',
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader',
      },
    ]
  },
  output: {
    filename: '[name]-bundle.js'
  },
  plugins: [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin()
  ]
}

const path = require('path');

module.exports = {
  context: path.join(__dirname, './src'),
  entry: {
    main: './main.jsx',
  },
  output: {
    path: path.join(__dirname, './data'),
    filename: 'bundle.js',
  },
  module: {
    loaders: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          presets: ['react', 'es2015'],
        },
      },
      {
        test: /\.css$/,
        loader: 'style!css',
      },
    ],
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
  },
};

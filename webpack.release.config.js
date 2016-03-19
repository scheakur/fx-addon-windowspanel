const config = require('./webpack.config.js');
const webpack = require('webpack');

config.module.loaders.push({
  test: /\.(js|jsx)$/,
  exclude: /node_modules/,
  loader: 'strip',
  query: {
    strip: ['console.log'],
  },
});


config.plugins = config.plugins || [];
config.plugins.push(
  new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV': JSON.stringify('production'),
    },
  })
);

module.exports = config;

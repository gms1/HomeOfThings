const webpack = require('webpack');
const util = require('util');
const path = require('path');

util.inspect.defaultOptions.depth = null;
util.inspect.defaultOptions.colors = true;

const cli = path.resolve(__dirname, 'src', 'cli.ts');

module.exports = (config, _context) => {
  // console.log('input webpack config:', config);
  config.plugins = [
    ...(config.plugins || []),
    new webpack.ProvidePlugin({
      openapi: '@nestjs/swagger',
    }),
  ];
  // console.log('output webpack config:', config);
  return config;
};

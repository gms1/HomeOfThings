const { defaults } = require('jest-config');
module.exports = {
  projects: [
    '<rootDir>/projects/node/libs/nestjs-config',
    '<rootDir>/projects/node/apps/hot-gateway',
    '<rootDir>/projects/node/libs/nestjs-logger',
    '<rootDir>/projects/node/libs/hot-express',
  ],
};

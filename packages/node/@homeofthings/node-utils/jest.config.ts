export default {
  displayName: 'node-utils',
  preset: '../../../../jest.preset.js',
  testEnvironment: 'node',
  coverageDirectory: '../../../../coverage/packages/node/@homeofthings/node-utils',
  // Integration tests that need the real `config` module are excluded because
  // the `config` npm package cannot be loaded in Jest ESM mode (its .js files
  // use ESM syntax but lack "type": "module", causing cjs-module-lexer to fail).
  testPathIgnorePatterns: ['config.service.integration.spec.ts'],
};

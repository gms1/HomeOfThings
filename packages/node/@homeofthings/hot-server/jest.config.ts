export default {
  displayName: 'hot-server',
  preset: '../../../../jest.preset.js',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../../coverage/packages/node/@homeofthings/hot-server',
  // Integration tests that need the real `config` module are excluded because
  // the `config` npm package cannot be loaded in Jest ESM mode (its .js files
  // use ESM syntax but lack "type": "module", causing cjs-module-lexer to fail).
  testPathIgnorePatterns: ['<rootDir>/src/lib/test/integration'],
};

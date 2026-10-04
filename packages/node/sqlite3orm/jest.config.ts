export default {
  displayName: 'sqlite3orm',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/packages/node/sqlite3orm',
  // CI runners may be heavily oversubscribed (2 vCPUs shared with multiple
  // jest workers and coverage instrumentation), causing trivial tests to
  // exceed the default timeout of 5000 ms
  testTimeout: 30000,
};

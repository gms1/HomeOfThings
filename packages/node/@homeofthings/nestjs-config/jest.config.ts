export default {
  displayName: 'nestjs-config',
  preset: '../../../../jest.preset.js',
  testEnvironment: 'node',
  coverageDirectory: '../../../../coverage/packages/node/@homeofthings/nestjs-config',
  // Integration tests do deep imports of config v5 modules (e.g. config/lib/util.js).
  // Config v5 is intentionally dual CJS/ESM — config.js is CJS, config.mjs is ESM,
  // but util.js uses ESM syntax without "type":"module" in package.json.
  // Jest's ESM mode cannot resolve these deep .js imports properly because
  // cjs-module-lexer fails when it encounters ESM syntax in a .js file without
  // "type":"module". See ADR-001 in memory-bank/decisions/.
  testPathIgnorePatterns: ['config.service.integration.spec.ts'],
};

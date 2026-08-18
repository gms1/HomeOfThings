/**
 * Stub for the `config` npm package.
 *
 * The `config` package (node-config) v5 ships .js files that contain ESM
 * syntax (import/export) without "type": "module" in package.json. Jest's
 * ESM mode uses cjs-module-lexer to parse such .js files as CJS, which
 * fails on ESM syntax. This stub allows unit tests to import `config`
 * without loading the real module.
 *
 * Unit tests override this stub with jest.unstable_mockModule('config', ...).
 */
module.exports = {};

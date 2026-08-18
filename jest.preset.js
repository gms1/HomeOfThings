const path = require('path');
const nxPreset = require('@nx/jest/preset').default;

nxPreset.coverageReporters = ['lcov', 'json', 'text-summary'];
nxPreset.collectCoverage = true;
nxPreset.passWithNoTests = true;
nxPreset.globalSetup = path.resolve(__dirname, 'jest.global-setup.js');

// Override the Nx preset transform to enable ESM support.
// The Nx preset for Jest 30 uses '^.+\\.(ts|js|mts|mjs|cts|cjs|html)$' which
// processes all those file types through ts-jest without useESM. We need
// useESM: true for spec files that use import.meta, top-level await, and
// jest.unstable_mockModule.
//
// NOTE: diagnostics.ignoreCodes suppresses TS1343/TS1378 false positives.
// ts-jest doesn't properly resolve "module": "esnext" through project-reference
// tsconfig chains (where tsconfig.json has "files": [], "include": []), causing
// it to incorrectly flag import.meta and top-level await as errors.
nxPreset.transform = {
  '^.+\\.tsx?$': [
    'ts-jest',
    {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      useESM: true,
      diagnostics: {
        ignoreCodes: [1343, 1378],
      },
    },
  ],
};

// The `config` npm package (node-config) v5 ships .js files that contain ESM
// syntax (import/export) without "type": "module" in package.json. Jest's ESM
// mode uses cjs-module-lexer to parse such .js files as CJS, which fails on
// ESM syntax. This stub allows unit tests to import `config` without loading
// the real module. Unit tests override this stub with
// jest.unstable_mockModule('config', ...).
const configStubPath = path.resolve(__dirname, 'jest.mocks/config.js');

module.exports = {
  ...nxPreset,
  // Merge inherited coveragePathIgnorePatterns (if any) with our local entries.
  coveragePathIgnorePatterns: [...(nxPreset.coveragePathIgnorePatterns || []), 'node_modules', 'test'],
  extensionsToTreatAsEsm: ['.ts'],
  // Merge inherited moduleNameMapper (if any) with our local mappings.
  moduleNameMapper: {
    ...(nxPreset.moduleNameMapper || {}),
    '^config$': configStubPath,
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};

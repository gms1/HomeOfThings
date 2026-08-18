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

// Absolute path to the config/lib/util.js stub – must be computed here because
// <rootDir> in moduleNameMapper resolves per-package (to the package directory),
// not to the workspace root. Individual tests that need specific mock behavior
// use jest.unstable_mockModule('config/lib/util.js', ...) which takes precedence
// over this moduleNameMapper entry.
const configLibUtilStubPath = path.resolve(__dirname, 'jest.mocks/config-lib-util.js');

module.exports = {
  ...nxPreset,
  coveragePathIgnorePatterns: ['node_modules', 'test'],
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^config/lib/util\\.js$': configLibUtilStubPath,
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};

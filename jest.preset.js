const path = require('path');
const nxPreset = require('@nx/jest/preset').default;

nxPreset.coverageReporters = ['lcov', 'json', 'text-summary'];
nxPreset.collectCoverage = true;
nxPreset.passWithNoTests = true;
nxPreset.globalSetup = path.resolve(__dirname, 'jest.global-setup.js');

module.exports = { ...nxPreset, coveragePathIgnorePatterns: ['node_modules', 'test'] };
